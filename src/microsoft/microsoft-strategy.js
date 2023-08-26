const passport = require("passport");
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const config = require("../../config");

function extractProfile(profile, auth) {
  const id = profile.id;
  const result = {};

  result[id] = {
    id: id,
    displayName: profile.displayName,
    email: profile.emails[0].value,
    provider: "microsoft",
    auth,
  };

  return result;
}

const { client_id, client_secret, callback_url, scope } = config.microsoft;
passport.use(
  new MicrosoftStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: callback_url,
      scope,
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
