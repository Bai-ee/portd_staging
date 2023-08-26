const { getGoogleCalendarEvents } = require("../google/google-calendar");
const {
  getMicrosoftCalendarEvents,
} = require("../microsoft/microsoft-calendar");
const {getCalendlyCalendarEvents} = require("../calendly/calendly-calendar");
const {loggingKeys, log} = require("../helpers/utils");

const getMeetings = (reqMetadata, userAccounts) => {
  return new Promise(async (resolve, reject) => {
    let accounts = {};
    let meetings = [];

    try {
      if (!(userAccounts && userAccounts.length)) {
        return resolve({ accounts: userAccounts, meetings, meetingsFetchedSuccess: false });
      }
      await Promise.all(
        userAccounts.map(async (account) => {
          if (account) {
            const { id, provider, email, displayName } = account;
            reqMetadata = {...reqMetadata, userId: id, email};
            log(reqMetadata, loggingKeys.MEETINGS_REQUESTED, {provider});
            accounts[id] = account;

            let result;
            if (provider === "google") {
              result = await getGoogleCalendarEvents(reqMetadata, account);
            } else if (provider === "microsoft") {
              result = await getMicrosoftCalendarEvents(reqMetadata, account);
            } else if (provider === "calendly") {
              result = await getCalendlyCalendarEvents(reqMetadata, account);
            }

            if (result && result.account) {
              const accountId = result.account.id;
              accounts[accountId] = result.account;
              meetings = meetings.concat(result.calendarList);
            }
          }
        })
      );

      return resolve({ accounts, meetings, meetingsFetchedSuccess: true });
    } catch (error) {
      log(reqMetadata, loggingKeys.MEETINGS_FETCH_FAILED, {error});
      return resolve({ accounts, meetings, meetingsFetchedSuccess: false });
    }
  });
};

module.exports = {
  getMeetings,
};

