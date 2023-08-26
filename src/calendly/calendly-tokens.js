const qs = require("qs");
const axios = require("axios");
const config = require("../../config");
const {loggingKeys, log} = require("../helpers/utils");
const { client_id, client_secret } = config.calendly;

module.exports = {
  getNewAccessToken: async function (reqMetadata, auth) {
    return new Promise(async (resolve, reject) => {
      try {
        const postData = {
          grant_type: "refresh_token",
          client_id,
          client_secret,
          refresh_token: auth.refreshToken,
        };

        let data;
        try {
          const response = await axios.post(
            "https://auth.calendly.com/oauth/token",
            qs.stringify(postData),
            {
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded;charset=UTF-8",
              },
            }
          );
          data = response.data;
        } catch (error) {
          return resolve(null);
        }

        if (!data) {
          return resolve(null);
        }

        resolve({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expires_in: data.expires_in,
        });
      } catch (error) {
        log(reqMetadata, loggingKeys.CALENDLY_TOKEN_REFRESH_FAILED, {error});
        resolve(null);
      }
    });
  },
};
