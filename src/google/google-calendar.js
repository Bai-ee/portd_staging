/**
 * Try google_calendar.events.watch
 * https://developers.google.com/calendar/api/guides/push
 * https://developers.google.com/calendar/api/v3/reference/events/watch
 * https://elfsight.com/blog/2020/05/how-to-use-google-calendar-api-v3-cost-limits-examples/
 * https://datebook.dev/
 */
const gcal = require("google-calendar");
const htmlToText = require('html-to-text');
const { getNewAccessToken } = require("./google-tokens");
const {
  getDateRangeInRFC3339Format,
  meetingURLDetector,
  meetingURLMatcher,
  loggingKeys,
  log
} = require("../helpers/utils");

const config = require("../../config");

const getCalendarEvents = (reqMetadata, account, calendarId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { id : accountId, email, auth } = account;
      const { accessToken } = auth;
      const google_calendar = new gcal.GoogleCalendar(accessToken);

      calendarId = calendarId ? calendarId : "primary";
      const { timeMin, timeMax } = getDateRangeInRFC3339Format();

      google_calendar.events.list(
        calendarId,
        {
          calendarId,
          timeMin,
          timeMax,
          showDeleted: false,
          singleEvents: true,
          orderBy: "startTime",
        },
        async function (error, result) {
          if(result != null){
            result = JSON.parse(result);
          }
          
          if(result != null && result.error != null && result.error.code){
            error = result.error;
          }
          
          if (error) {
            if (error.code === 401) {
              log(reqMetadata, loggingKeys.GOOGLE_MEETINGS_AUTH_ERROR, {data: null});
              const { auth } = account;
              const newAuth = await getNewAccessToken(reqMetadata, auth);

              if (!newAuth) {
                log(reqMetadata, loggingKeys.GOOGLE_TOKEN_REFRESH_FAILED, {data: null});
                return reject("Failed to get new access token");
              }

              log(reqMetadata, loggingKeys.GOOGLE_TOKEN_REFRESHED, {data: null});
              account.auth = newAuth;
              const result = await getCalendarEvents(reqMetadata, account);

              return resolve(result);
            } else {
              return reject(error);
            }
          }

          let calendarList = [];
          if (result.items && result.items.length) {
            log(reqMetadata, loggingKeys.GOOGLE_EVENTS_TOTAL_COUNT, {length: result.items.length});
            result.items.forEach((item) => {
              let zoomiesItem = transformCalendarEventToZoomiesSchema(accountId, email, item);
              if (zoomiesItem) {
                calendarList.push(zoomiesItem);
              } else {
                log(reqMetadata, loggingKeys.GOOGLE_EVENT_FILTERED_OUT, {item});
              }
            });
          }
          log(reqMetadata, loggingKeys.GOOGLE_EVENTS_RETURNED_COUNT, {length: calendarList.length});
          return resolve({ account, calendarList });
        }
      );
    } catch (error) {
      log(reqMetadata, loggingKeys.GOOGLE_MEETINGS_FETCH_FAILED, {error});
      return reject(error);
    }
  });
};

const transformCalendarEventToZoomiesSchema = (accountId, email, event) => {
  if (!event) {
    return null;
  }
  const { location, start, summary, description, conferenceData, htmlLink } = event;

  let link = meetingURLDetector(location);

  if (!link && description) {
    const bodyText = htmlToText.fromString(description, {
      wordwrap: 9999
    });
    link = meetingURLDetector(bodyText);
  }

  if (!link && description) {
    link = meetingURLDetector(description);
  }

  if (!link && conferenceData && conferenceData.entryPoints) {
    const conferenceDataUrls = conferenceData.entryPoints
      .filter((entryPoint) => {
        return entryPoint.entryPointType === "video";
      })
      .map((entryPoint) => {
        return entryPoint.uri;
      });

    link = meetingURLMatcher(conferenceDataUrls);
  }

  if (start) {
    return {
      startTime: start.dateTime,
      agenda: summary,
      link,
      provider: "google",
      accountId,
      eventHtmlLink: meetingHtmlLinkTransformer(email, htmlLink) || `${config.domain_url}/404`
    };
  }
  return null;
};

const meetingHtmlLinkTransformer = (email, htmlLink) => {
  if (!htmlLink) {
    return `${config.domain_url}/404`;
  }

  htmlLink = htmlLink.replace("calendar/event", `calendar/u/${email}/event`);
  return htmlLink;
}

module.exports = {
  getGoogleCalendarEvents: getCalendarEvents,
  transformCalendarEventToZoomiesSchema
};

