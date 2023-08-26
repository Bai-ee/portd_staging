const DOMAIN_URL = "https://portd.io";

module.exports = {
    domain_url: DOMAIN_URL,
    google: {
        client_id: "890713579283-fbh3pu7dri82onmhpacq4nj8an0shd7p.apps.googleusercontent.com",
        client_secret: "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",
        callback_url: `${DOMAIN_URL}/register/google/callback`,
        scope: [
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.readonly",
        ],
        urls: {
            user_profile_url: "https://www.googleapis.com/oauth2/v3/userinfo",
            refresh_token_url: "https://www.googleapis.com/oauth2/v4/token"
        }
    },
    microsoft: {
        client_id: "7999deff-694a-4a38-b705-dcd230865ad7",
        client_secret: "xw08Q~Xbl48wrmNX~SM3IpfF.qOv90l0~oHAWc~E",
        callback_url: `${DOMAIN_URL}/register/microsoft/callback`,
        scope: ['user.read', 'calendars.read', "offline_access"],
        urls: {
            refresh_token_url: "https://login.microsoftonline.com/common/oauth2/v2.0/token"
        }
    },
    calendly: {
        client_secret: "5le7CaEQWhaFCiGwHtIgmz86Owd-oVTDjOhLoPpqZZM",
        name: "Portd",
        client_id: "7VtmzxvH9bWmHeCGzDHQ14m-CeQNgd1jZOkSp20xjOM",
        redirect_uri: "https://www.portd.io/register/calendly/callback",
        developer_email: "support@portd.io",
        webhook_signing_key: "-8ys0oh_JUq02xFM8h5oQdVxmvn4vxW_XeSK9e6MTKQ"
    },
    loggingOpts: {
        logDirectory: "./logs", // NOTE: folder must exist and be writable...
        fileNamePattern: "roll-<DATE>.log",
        dateFormat: "YYYY.MM.DD",
    },
    branding: { // NOTE: This is not used in the project.
        //'uber.com': `${DOMAIN_URL}/images/brands/uber.png`,
        //'spotify.com': `${DOMAIN_URL}/images/brands/spotify.png`,
        //'vmware.com': `${DOMAIN_URL}/images/brands/vmware.png`,
    }
};
