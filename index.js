const express = require("express");
const passport = require("passport");
const { randomUUID } = require('crypto');
const routes = require("./api");

const app = express();
app.use(express.json({ extended: false }));
app.use(passport.initialize());
app.set('trust proxy', 1);
app.use(express.static(__dirname + "/static"));
app.use((req, res, next) => {
    req.id = randomUUID();
    next();
})

app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
