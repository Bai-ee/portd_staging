const qs = require("qs");
const axios = require("axios");
const config = require("../../config");
const { client_id, client_secret, redirect_uri } = config.calendly;

const extractProfile = (auth) => {
  return new Promise(async (resolve, reject) => {
    let data;
    try {
      const response = await axios.get("https://api.calendly.com/users/me", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.accessToken}`,
          }
      });
      data = response.data;
    } catch (error) {
      return resolve(null);
    }

    if (!(data && data.resource)) {
      return resolve(null);
    }

    const profile = data.resource;
    const userIdTmp = profile.uri.split("/users/");
    const id = userIdTmp != null && userIdTmp.length > 1 ? userIdTmp[1] : null;
    if (!id) {
      return resolve(null);
    }

    const result = {};
    result[id] = {
      id,
      displayName: profile.name,
      email: profile.email,
      provider: "calendly",
      auth,
    };

    resolve(result);
  });
};

const getUser = (code) => {
  return new Promise(async (resolve, reject) => {
    if(!code){
        return resolve(null);
    }

    const postData = {
      grant_type: "authorization_code",
      client_id,
      client_secret,
      code,
      redirect_uri,
    };

    let data;
    try {
      const response = await axios.post(
        "https://auth.calendly.com/oauth/token",
        qs.stringify(postData),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
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

    const auth = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expires_in: data.expires_in,
    };

    const user = await extractProfile(auth);
    return resolve(user);
  });
};

module.exports = {
  getUser,
};
