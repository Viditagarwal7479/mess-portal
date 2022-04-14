const express = require("express");
const bodyParser = require("body-parser");

const emailValidator = require("deep-email-validator");

const db = require("../data/database");
const bcryptjs = require("bcryptjs");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());
const session = require("express-session");

const createSessionConfig = require("../config/sessions");

const sessionConfig = createSessionConfig();
app.use(session(sessionConfig));

const router = express.Router();
const CLIENT_ID =
  "1006096379075-2o56con4lhsrpbviut9ok2722q0sjiue.apps.googleusercontent.com";

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

router.get("/", function (req, res) {
  console.log(res.locals.isAuth);
  res.render("welcome");
});

router.get("/attendance", function (req, res) {
  res.render("attendance");
});

router.get("/hostel/:id", function (req, res) {
  const id = req.params.id;
  res.render("hostel", { id: id });
});

router.get("/feedback", function (req, res) {
  console.log(req.session.user);
  res.render("feedback", { data: req.session.user });
  // res.send("hello");
});

router.post("/feedback", function (req, res) {
  console.log(req.body.message);
  console.log(req.body.name);
  console.log(req.body.email);
  res.redirect("/");
});

router.get("/contact", function (req, res) {
  // console.log(req.session);
  res.render("contact-us");
});

router.get("/login", function (req, res) {
  const data = req.session.user;

  res.render("login", { data: data });
});

router.post("/login", async function (req, res) {
  const token = req.body.token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  const ticket = await verify();
  // console.log(ticket);
  res.cookie("session-cookie", token);
  res.send("success");
  const user = { email: ticket.email, name: ticket.name };
  req.session.user = user;
  req.session.isAuth = true;
  res.locals.isAuth = true;
  req.session.save();
  console.log(req.session.user);
});

router.get("/admin", function (req, res) {
  res.render("admin");
});
router.get("/messChange", function (req, res) {
  res.render("mess-change");
});

router.get("/balance", function (req, res) {
  res.render("balance");
});

router.get("/signout", async function (req, res) {
  const email = req.session.user.email;
  await db.getDb().collection("sessions").deleteOne({ email: email });
  res.locals.isAuth = false;
  res.redirect("/");
});

module.exports = router;
