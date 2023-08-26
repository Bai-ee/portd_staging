const qs = require("qs");
const config = require("../../config");
const axios = require('axios');
const {loggingKeys, log} = require("../helpers/utils");

module.exports = {
  getNewAccessToken: async function (reqMetadata, auth) {
    return new Promise(async (resolve, reject) => {
      try {
        const { client_id, client_secret, scope, urls } = config.microsoft;
        const postData = {
          client_id,
          client_secret,
          scope,
          grant_type: "refresh_token",
          refresh_token: auth.refreshToken,
        };

        const response = await axios.post(urls.refresh_token_url,  qs.stringify(postData), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          }
        });

        let data = response.data;
        if (data) {
          resolve({
            accessToken: data.access_token,
            refreshToken: data.refresh_token || auth.refreshToken,
            expires_in: data.expires_in,
          });
        } else {
          resolve(null);
        }
      } catch (error) {
        log(reqMetadata, loggingKeys.MICROSOFT_TOKEN_REFRESH_FAILED, {error});
        resolve(null);
      }
    });
  },
};
