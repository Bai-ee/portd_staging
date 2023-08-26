const apis = [
  "alarms",
  "bookmarks",
  "browserAction",
  "commands",
  "contextMenus",
  "cookies",
  "downloads",
  "events",
  "extension",
  "extensionTypes",
  "history",
  "i18n",
  "idle",
  "notifications",
  "pageAction",
  "runtime",
  "storage",
  "tabs",
  "webNavigation",
  "webRequest",
  "windows",
];

const BrowserApiFactory = (function () {
  function BrowserApi() {
    const _this = this;

    apis.forEach(function (api) {
      _this[api] = null;

      try {
        if (chrome[api]) {
          _this[api] = chrome[api];
        }
      } catch (e) {}

      try {
        if (window[api]) {
          _this[api] = window[api];
        }
      } catch (e) {}

      try {
        if (browser[api]) {
          _this[api] = browser[api];
        }
      } catch (e) {}
      try {
        _this.api = browser.extension[api];
      } catch (e) {}
    });

    try {
      if (browser && browser.runtime) {
        this.runtime = browser.runtime;
      }
    } catch (e) {}

    try {
      if (browser && browser.browserAction) {
        this.browserAction = browser.browserAction;
      }
    } catch (e) {}
  }

  var browserApi;
  return {
    getInstance: function () {
      if (browserApi == null) {
        browserApi = new BrowserApi();
        browserApi.constructor = null;
      }
      return browserApi;
    },
  };
})();

function boot() {
  const browserApi = BrowserApiFactory.getInstance();
  injectStyles(browserApi.runtime.getURL("/src/inject/notes_theme.css"));
  injectStyles(browserApi.runtime.getURL("/src/inject/notes.css"));
  injectScripts(browserApi.runtime.getURL("/src/inject/utils.js"));
  injectScripts(browserApi.runtime.getURL("/src/inject/rte.js"));
  injectScripts(browserApi.runtime.getURL("/src/inject/notes.js"));
}

function injectStyles(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function injectScripts(src) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = src;
  document.body.appendChild(script);
}

boot();
