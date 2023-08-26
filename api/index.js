const express = require("express");
const passport = require("passport");
const path = require("path");
const router = express.Router();
let microsoftIdentityAssociationJson = require("../microsoft-identity-association.json");
require("../src/google/google-strategy");
require("../src/microsoft/microsoft-strategy");
const { getUser } = require("../src/calendly/calendly-strategy");

const { getMeetings } = require("../src/services/meetings");
const { branding, calendly } = require("../config");
const { loggingKeys, log } = require("../src/helpers/utils");

router.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve("./") + "/views/index.html"));
});

router.get("/view-event-details", (req, res) => {
  res.sendFile(
    path.join(path.resolve("./") + "/views/view-event-details.html")
  );
});

router.get("/business", (req, res) => {
  res.sendFile(path.join(path.resolve("./") + "/views/business.html"));
});

router.get("/privacy-policy", (req, res) => {
  res.sendFile(path.join(path.resolve("./") + "/views/privacy-policy.html"));
});

router.get("/terms-of-service", (req, res) => {
  res.sendFile(path.join(path.resolve("./") + "/views/terms-of-service.html"));
});

router.get("/uninstall", (req, res) => {
  res.sendFile(path.join(path.resolve("./") + "/views/uninstall.html"));
});

router.get("/404", (req, res) => {
  res.sendFile(path.join(path.resolve("./") + "/views/404.html"));
});

router.get("/auth/callback", function (req, res) {
  res.sendFile(path.join(path.resolve("./") + "/views/callback.html"));
});

router.post("/api/branding", (req, res) => {
  const domains = req.body.brandDomains;
  let brandImages = {};

  if (!domains) {
    res.end(JSON.stringify({ brandImages }));
    return;
  }

  for (let id in domains) {
    let domain = domains[id];
    let brandImage = branding[domain] || null;
    if (brandImage) {
      brandImages[id] = brandImage;
    }
  }

  res.end(JSON.stringify({ brandImages }));
});

router.get("/.well-known/microsoft-identity-association.json", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Accept-Enconding": "application/json",
    "Content-Length": Buffer.byteLength(
      JSON.stringify(microsoftIdentityAssociationJson),
      "utf-8"
    ),
  });
  res.end(JSON.stringify(microsoftIdentityAssociationJson));
});

// Api call for google authentication
router.get(
  "/google",
  passport.authenticate("google", {
    accessType: "offline",
    prompt: "consent",
    session: false,
  }),
  () => {}
);

// Api call back function
router.get(
  "/register/google/callback",
  passport.authenticate("google", {
    accessType: "offline",
    prompt: "consent",
    session: false,
  }),
  (req, res) => {
    if (req && req.user) {
      const { id, displayName, email, provider, auth } = Object.values(
        req.user
      )[0];
      let queryParams = new URLSearchParams({
        id,
        displayName,
        email,
        provider,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        expires_in: auth.expires_in,
      }).toString();

      const reqMetadata = {
        reqId: req.id,
        userId: id,
        email
      }
      log(reqMetadata, loggingKeys.GOOGLE_LOGIN_COMPLETED, {data: null});
      res.redirect("/auth/callback?" + queryParams);
    } else {
      res.sendFile(path.join(path.resolve("./") + "/views/404.html"));
    }
  }
);

// Api call for google authentication
router.get(
  "/microsoft",
  passport.authenticate("microsoft", {
    accessType: "offline",
    prompt: "consent",
    session: false,
  }),
  () => {}
);

// Api call back function
router.get(
  "/register/microsoft/callback",
  passport.authenticate("microsoft", {
    accessType: "offline",
    prompt: "consent",
    session: false,
  }),
  (req, res) => {
    if (req && req.user) {
      const { id, displayName, email, provider, auth } = Object.values(
        req.user
      )[0];
      let queryParams = new URLSearchParams({
        id,
        displayName,
        email,
        provider,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        expires_in: auth.expires_in,
      }).toString();
      
      const reqMetadata = {
        reqId: req.id,
        userId: id,
        email
      }
      log(reqMetadata, loggingKeys.MICROSOFT_LOGIN_COMPLETED, {data: null});
      res.redirect("/auth/callback?" + queryParams);
    } else {
      res.sendFile(path.join(path.resolve("./") + "/views/404.html"));
    }
  }
);

router.get("/calendly", (req, res) => {
  const { client_id, redirect_uri } = calendly;
  res.redirect(
    `https://auth.calendly.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}`
  );
});

// Api call back function
router.get("/register/calendly/callback", async(req, res) => {
  const user = await getUser(req.query.code);
  if (user) {
    const { id, displayName, email, provider, auth } = Object.values(user)[0];
    let queryParams = new URLSearchParams({
      id,
      displayName,
      email,
      provider,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      expires_in: auth.expires_in
    }).toString();
    
    const reqMetadata = {
      reqId: req.id,
      userId: id,
      email
    }
    log(reqMetadata, loggingKeys.CALENDLY_LOGIN_COMPLETED, {data: null});
    res.redirect("/auth/callback?" + queryParams);
  } else {
    res.sendFile(path.join(path.resolve("./") + "/views/404.html"));
  }
});

router.post("/api/meetings", async (req, res) => {
  try {
    const result = await getMeetings({reqId: req.id}, req.body.data);
    res.end(JSON.stringify(result));
  } catch (e) {
    res.end(null);
  }
});

module.exports = router;
