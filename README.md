# Zoomies Backend On Vercel
Speed dial to your Remote meetings.

### Pre-requisites
- Vercel account
- Google Oauth2 Client
    - Requires a Google Developer Console account
    - Read how to setup Google Oauth2 client [here](https://support.google.com/cloud/answer/6158849?hl=en).
- Microsoft Oauth2 Client
    - Requires a Microsoft Azure account.
    - See how to setup Microsoft [here](https://www.youtube.com/watch?v=7qt8asY33Aw).
- Node v14.x.

### Local Development
- Read on how to use Express.js with Vercel [here](https://vercel.com/guides/using-express-with-vercel).
- Get started with the following commands -
    - Run ```npm install```
    - Run ```node index.js```
    - Use API clients like Postman to test APIs.

### Project structure
- api
    - index.js
        - All API definitions and controller calls.
    - src
        - google
            - google-calendar.js
                - Interacts with google calendar APIs
            - google-strategy.js
                - Passport.js strategy for Google auth.
            - google-tokens.js
                - Token management for user's access/refresh tokens.
        - microsoft
            - microsoft-calendar.js
                - Interacts with microsoft-outlook calendar APIs
            - microsoft-strategy.js
                - Passport.js strategy for Microsoft auth.
            - microsoft-tokens.js
                - Token management for user's access/refresh tokens.
        - helpers
            - utils.js
                - Helper functions used across project.
        - services
            - meetings.js
                - Service layer for interacting with Google/Microsoft meetings meetings APIs.
    - static
        - css
            - Styling for pages on https://zoomiesoncall.online
            - index.css
                - Custom styles for all pages on https://zoomiesoncall.online
            - style.css
                - Copy of papercss.
        - images
            - Images used in pages on https://zoomiesoncall.online
        - views
            - Various html pages of https://zoomiesoncall.online
    - config.js
        - Credentials of Google/Microsoft Oauth clients.
    - index.js
        - Express.js setup
    - microsoft-identity-association.json
        - Required file by Microsoft oauth client
    - vercel.json
        - Vercel config for running express app on vercel.
### Deploy to Production
* See how to deploy project on Vercel [here](https://www.youtube.com/watch?v=rtnwvw7HsWY).

### Author
[@Piyush Santwani](https://www.linkedin.com/in/piyushsantwani/)

### License
This project is licensed under the Apache License - see the LICENSE.md file for details.# portd_staging
