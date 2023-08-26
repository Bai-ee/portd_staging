const { URLSearchParams, URL } = require('url');
const graph = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");
const htmlToText = require('html-to-text');
const { getNewAccessToken } = require("./microsoft-tokens");
const {
  getDateRangeInRFC3339Format,
  meetingURLDetector,
  loggingKeys,
  log
} = require("../helpers/utils");

const config = require("../../config");

const getCalendarEvents = async function (reqMetadata, account) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id : accountId, email, auth } = account;
      const { accessToken } = auth;

      const client = getAuthenticatedClient(accessToken);
      const { timeMin, timeMax } = getDateRangeInRFC3339Format();

      const events = await client
        .api(`/me/calendarview?startDateTime=${timeMin}&endDateTime=${timeMax}&top=50&select=subject,start,end,location,body,webLink`)
        .orderby("start/dateTime")
        .get();

      let calendarList = [];
      if (events.value && events.value.length) {
        log(reqMetadata, loggingKeys.MICROSOFT_EVENTS_TOTAL_COUNT, {length: events.value.length});
        events.value.forEach((item) => {
          let zoomiesItem = transformCalendarEventToZoomiesSchema(accountId, email, item);
          if (zoomiesItem) {
            calendarList.push(zoomiesItem);
          } else {
            log(reqMetadata, loggingKeys.MICROSOFT_EVENT_FILTERED_OUT, {item});
          }
        });
      }
      log(reqMetadata, loggingKeys.MICROSOFT_EVENTS_RETURNED_COUNT, {length: calendarList.length});
      return resolve({ account, calendarList });
    } catch (error) {
      if (error.statusCode === 401) {
        log(reqMetadata, loggingKeys.MICROSOFT_MEETINGS_AUTH_ERROR, {data: null});
        const { auth } = account;
        const newAuth = await getNewAccessToken(reqMetadata, auth);
        if (!newAuth) {
          log(reqMetadata, loggingKeys.MICROSOFT_TOKEN_REFRESH_FAILED, {data: null});
          return reject("Failed to get new access token");
        }

        log(reqMetadata, loggingKeys.MICROSOFT_TOKEN_REFRESHED, {data: null});
        account.auth = newAuth;
        const result = await getCalendarEvents(reqMetadata, account);
        return resolve(result);
      } else {
        return reject(error);
      }
    }
  });
};

const getAuthenticatedClient = (accessToken) => {
  const client = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  return client;
};

const transformCalendarEventToZoomiesSchema = (accountId, email, event) => {
  if (!(event && event.subject && event.start && event.location)) {
    return null;
  }

  const { location, start, subject, body, webLink } = event;

  let link = meetingURLDetector(location ? location.displayName : "");

  if (!link && body) {
    const bodyText = htmlToText.fromString(body.content, {
      wordwrap: 9999
    });
    link = meetingURLDetector(bodyText);
  }

  if (!link && body) {
    link = meetingURLDetector(body.content);
  }

  if (start) {
    return {
      startTime: start.dateTime,
      agenda: subject,
      link,
      provider: "microsoft",
      accountId,
      eventHtmlLink: meetingWebLinkTransformer(email, webLink),
    };
  }

  return null;
};

const meetingWebLinkTransformer = (email,webLink) => {
  if (!webLink) {
    return `${config.domain_url}/404`;
  }

  const arr = webLink.split("/");
  if (arr.length < 2) {
    return `${config.domain_url}/404`;
  }

  const url = new URL(webLink);
  const urlParams = new URLSearchParams(url.search);
  const itemId = urlParams.get('itemid');

  const domain = arr[2];
  if (domain === "outlook.office365.com") {
    return `https://outlook.office365.com/calendar/deeplink/read/${encodeURIComponent(itemId)}?login_hint=${encodeURIComponent(email)}`;
  } else if (domain === "outlook.live.com") {
    return `https://outlook.live.com/calendar/deeplink/read/${encodeURIComponent(itemId)}?login_hint=${encodeURIComponent(email)}`;
  } else {
    return `${config.domain_url}/404`;
  }
}

module.exports = {
  getMicrosoftCalendarEvents: getCalendarEvents,
};
