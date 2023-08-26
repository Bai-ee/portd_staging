const axios = require("axios");
const { getNewAccessToken } = require("./calendly-tokens");
const {
  getDateRangeInRFC3339Format,
  meetingURLDetector,
  loggingKeys,
  log
} = require("../helpers/utils");

const config = require("../../config");

const getCalendarEvents = (reqMetadata, account) => {
  return new Promise(async (resolve, reject) => {
    const { id: accountId, auth } = account;
    const { accessToken } = auth;
    const { timeMin, timeMax } = getDateRangeInRFC3339Format();

    let data;
    try {
      const response = await axios.get(
        "https://api.calendly.com/scheduled_events",
        {
          params: {
            user: `https://api.calendly.com/users/${accountId}`,
            min_start_time: timeMin,
            max_start_time: timeMax,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      data = response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log(reqMetadata, loggingKeys.CALENDLY_MEETINGS_AUTH_ERROR, {data: null});
        const { auth } = account;
        const newAuth = await getNewAccessToken(reqMetadata, auth);

        if (!newAuth) {
          log(reqMetadata, loggingKeys.CALENDLY_TOKEN_REFRESH_FAILED, {data: null});
          return reject("Failed to get new access token");
        }

        log(reqMetadata, loggingKeys.CALENDLY_TOKEN_REFRESHED, {data: null});
        account.auth = newAuth;
        const result = await getCalendarEvents(reqMetadata, account);

        return resolve(result);
      } else {
        return reject(error);
      }
    }

    if (!(data && data.collection)) {
      return resolve([]);
    }

    let calendarList = [];
    if (data.collection.length) {
      log(reqMetadata, loggingKeys.CALENDLY_EVENTS_TOTAL_COUNT, {length: data.collection.length});
      data.collection
        .filter((item) => {
          return item.status === "active";
        })
        .forEach((item) => {
          let zoomiesItem = transformCalendarEventToZoomiesSchema(
            accountId,
            item
          );
          if (zoomiesItem) {
            calendarList.push(zoomiesItem);
          } else {
            log(reqMetadata, loggingKeys.CALENDLY_EVENT_FILTERED_OUT, {item});
          }
        });
    }
    log(reqMetadata, loggingKeys.CALENDLY_EVENTS_RETURNED_COUNT, {length: calendarList.length});
    return resolve({ account, calendarList });
  });
};

const transformCalendarEventToZoomiesSchema = (accountId, event) => {
  if (!event) {
    return null;
  }
  const { location, start_time, name } = event;

  let link = meetingURLDetector(location.join_url);

  if (start_time) {
    return {
      startTime: start_time,
      agenda: name,
      link,
      provider: "calendly",
      accountId,
      eventHtmlLink: meetingHtmlLinkTransformer(link),
    };
  }
  return null;
};

const meetingHtmlLinkTransformer = (htmlLink) => {
  const defaultLink = `${config.domain_url}/404`;
  if (!htmlLink) {
    return defaultLink;
  }

  let htmlLinkTmp = htmlLink.split("/events/");
  htmlLink =
    htmlLinkTmp != null && htmlLinkTmp.length > 1
      ? htmlLinkTmp[1]
      : null;
    
  if(!htmlLink){
    return defaultLink;
  }
    
  htmlLinkTmp = htmlLink.split("/");
  htmlLink =
    htmlLinkTmp != null && htmlLinkTmp.length > 0
      ? htmlLinkTmp[0]
      : null;
  
  if(!htmlLink){
    return defaultLink;
  }
    
  const linkPrefix = "https://calendly.com/app/scheduled_events/user/me?uuid=";
  return `${linkPrefix}${htmlLink}`;
};

module.exports = {
  getCalendlyCalendarEvents: getCalendarEvents,
};
