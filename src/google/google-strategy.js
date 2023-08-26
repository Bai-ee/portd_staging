const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("../../config");

const extractProfile = (profile, auth) => {
  const id = profile.id;
  const result = {};

  result[id] = {
    id: id,
    displayName: profile.displayName,
    email: profile.emails[0].value,
    provider: "google",
    auth,
  };

  return result;
};

const { client_id, client_secret, callback_url, scope, urls } = config.google;
passport.use(
  new GoogleStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: callback_url,
      scope: scope,
      userProfileURL: urls.user_profile_url,
    },
    (accessToken, refreshToken, params, profile, cb) => {
      cb(
        null,
        extractProfile(profile, {
          accessToken,
          refreshToken,
          expires_in: params.expires_in,
        })
      );
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});
