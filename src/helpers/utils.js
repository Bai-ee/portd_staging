const linkify = require("linkifyjs");
const supportedPlatforms = [
    "zoom.us/",
    "teams.microsoft.com/",
    "meet.google.com/",
    "hangouts.google.com/call",
    "gotomeeting.com/join", // https://global.gotomeeting.com/join/940500661
    "webex.com/join", // https://meetingsapac41.webex.com/join/pr1665446038
    "join.skype.com/", // https://join.skype.com/XdHUVblkLGlP,
    "chime.aws/",
    "jiomeetpro.jio.com/",
    "jiomeet.jio.com/", // Not sure about this,
    "https?:\/\/[^/]+(\/zoom\/\/?.*$)", // https://xyz.me/zoom/,
    "calendly.com/events"
];

const loggingKeys = {
    GOOGLE_LOGIN_COMPLETED: "GOOGLE_LOGIN_COMPLETED",
    MICROSOFT_LOGIN_COMPLETED: "MICROSOFT_LOGIN_COMPLETED",
    CALENDLY_LOGIN_COMPLETED: "CALENDLY_LOGIN_COMPLETED",
    MEETINGS_REQUESTED: "MEETINGS_REQUESTED",
    MEETINGS_FETCH_FAILED: "MEETINGS_FETCH_FAILED",
    GOOGLE_MEETINGS_FETCH_FAILED: "GOOGLE_MEETINGS_FETCH_FAILED",
    MICROSOFT_MEETINGS_FETCH_FAILED: "MICROSOFT_MEETINGS_FETCH_FAILED",
    CALENDLY_MEETINGS_FETCH_FAILED: "CALENDLY_MEETINGS_FETCH_FAILED",
    GOOGLE_MEETINGS_AUTH_ERROR: "GOOGLE_MEETINGS_AUTH_ERROR",
    MICROSOFT_MEETINGS_AUTH_ERROR: "MICROSOFT_MEETINGS_AUTH_ERROR",
    CALENDLY_MEETINGS_AUTH_ERROR: "CALENDLY_MEETINGS_AUTH_ERROR",
    GOOGLE_TOKEN_REFRESH_FAILED: "GOOGLE_TOKEN_REFRESH_FAILED",
    MICROSOFT_TOKEN_REFRESH_FAILED: "MICROSOFT_TOKEN_REFRESH_FAILED",
    CALENDLY_TOKEN_REFRESH_FAILED: "CALENDLY_TOKEN_REFRESH_FAILED",
    GOOGLE_TOKEN_REFRESHED: "GOOGLE_TOKEN_REFRESHED",
    MICROSOFT_TOKEN_REFRESHED: "MICROSOFT_TOKEN_REFRESHED",
    CALENDLY_TOKEN_REFRESHED: "CALENDLY_TOKEN_REFRESHED",
    GOOGLE_EVENTS_TOTAL_COUNT: "GOOGLE_EVENTS_TOTAL_COUNT",
    MICROSOFT_EVENTS_TOTAL_COUNT: "MICROSOFT_EVENTS_TOTAL_COUNT",
    CALENDLY_EVENTS_TOTAL_COUNT: "CALENDLY_EVENTS_TOTAL_COUNT",
    GOOGLE_EVENT_FILTERED_OUT: "GOOGLE_EVENT_FILTERED_OUT",
    MICROSOFT_EVENT_FILTERED_OUT: "MICROSOFT_EVENT_FILTERED_OUT",
    CALENDLY_EVENT_FILTERED_OUT: "CALENDLY_EVENT_FILTERED_OUT",
    GOOGLE_EVENTS_RETURNED_COUNT: "GOOGLE_EVENTS_RETURNED_COUNT",
    MICROSOFT_EVENTS_RETURNED_COUNT: "MICROSOFT_EVENTS_RETURNED_COUNT",
    CALENDLY_EVENTS_RETURNED_COUNT: "CALENDLY_EVENTS_RETURNED_COUNT",
};

const getDateRangeInRFC3339Format = () => {
    // Today
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const timeMin = start.toISOString();

    // Next 7 days
    const end = new Date(new Date().getTime() + 24 * 5 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);
    const timeMax = end.toISOString();

    return {
        timeMin,
        timeMax,
    };
};

const meetingURLDetector = (str) => {
    let result = null;
    if (!str) {
        return result;
    }

    const urls = linkify.find(str) || [];
    for (let i = 0; i < urls.length; i++) {
        if (
            urls[i].type === "url" &&
            new RegExp(supportedPlatforms.join("|")).test(urls[i].value)
        ) {
            result = urls[i].value;
            break;
        }
    }

    return result;
};

const meetingURLMatcher = (urls) => {
    let result = null;
    if (!urls) {
        return result;
    }

    for (let i = 0; i < urls.length; i++) {
        if (new RegExp(supportedPlatforms.join("|")).test(urls[i])) {
            result = urls[i];
            break;
        }
    }

    return result;
}

const log = (reqMetadata, loggingKey, payload) => {
    console.log(JSON.stringify({
        reqMetadata,
        loggingKey,
        payload
    }))
}

module.exports = { loggingKeys, getDateRangeInRFC3339Format, meetingURLDetector, meetingURLMatcher, log };