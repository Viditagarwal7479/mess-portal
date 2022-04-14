const path = require("path");

const express = require("express");
// const cookieparser = require("cookie-parser");

const db = require("./data/database");

const demoRoutes = require("./routes/demo");

const app = express();
app.use(express.json());
const session = require("express-session");

const createSessionConfig = require("./config/sessions");

const sessionConfig = createSessionConfig();
app.use(session(sessionConfig));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({extended: false}));

app.use(demoRoutes);

// app.use(function (error, req, res, next) {

//   res.render("500");
// });

db.connectToDatabase().then(function () {
    app.listen(3000);
});
