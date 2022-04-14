const express = require("express");
const bodyParser = require("body-parser");

const db = require("../data/database");
const ObjectId = require("mongodb").ObjectID;
var nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
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

const {OAuth2Client} = require("google-auth-library");
const {hash} = require("bcrypt");
const client = new OAuth2Client(CLIENT_ID);

router.get("/", function (req, res) {
    res.locals.isAuth = req.session.isAuth;

    res.render("welcome");
});

router.get("/attendance", function (req, res) {
    if (req.session.isAuth) {
        res.locals.isAuth = true;
    } else res.locals.isAuth = false;
    res.render("attendance");
});

router.post("/attendance", async function (req, res) {
    // ***********************************************

    // console.log(req.session.user.email);
    const user = await db
        .getDb()
        .collection("users")
        .findOne({rollNumber: req.body.rollNumber});

    if (!user) {
        res.render("500");
        return;
    }
    console.log(req.body.password);
    const hashedPassword = bcrypt.hash(req.body.password, 12);
    console.log(user.password);
    const bool = await bcrypt.compare(req.body.password, user.password);
    if (bool) {
        const data = {message: "Successful", hasError: false};
        res.redirect("/attendance", {data: data});
    } else {
        const data = {message: "Check credintials", hasError: true};
        res.redirect("/attendance", {data: data});
    }

    // ***********************************************
});

router.get("/hostel/:id", function (req, res) {
    res.locals.isAuth = req.session.isAuth;

    const id = req.params.id;
    res.render("hostel", {id: id});
});

router.get("/feedback", function (req, res) {
    res.locals.isAuth = req.session.isAuth;
    res.render("feedback", {data: req.session.user});
    // res.send("hello");
});

router.post("/feedback", function (req, res) {
    console.log(req.body.message);
    const feedback = {
        email: req.body.email,
        name: req.body.name,
        message: req.body.message,
    };

    db.getDb().collection("feedback").insertOne(feedback);
    res.redirect("/");
});

router.get("/contact", function (req, res) {
    res.locals.isAuth = req.session.isAuth;

    res.render("contact-us");
});

router.get("/login", function (req, res) {
    res.locals.isAuth = req.session.isAuth;

    const data = req.session.user;

    res.render("login", {data: data});
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
    res.cookie("session-cookie", token);
    res.send("success");
    const user = {email: ticket.email, name: ticket.name};
    req.session.user = user;
    req.session.isAuth = true;
    res.locals.isAuth = true;
    req.session.save();
});

router.get("/admin", function (req, res) {
    res.render("admin");
});
router.get("/messChange", function (req, res) {
    res.locals.isAuth = req.session.isAuth;

    res.render("mess-change", {data: req.session.user});
});

router.post("/mess-change", function (req, res) {
    console.log(req.body.current);
    console.log(req.body.messname);
    const user = db
        .getDb()
        .collection("users")
        .findOne({email: req.body.email});
    user.mess = req.body.messname;
    db.getDb().collection("users").deleteOne({email: req.body.email});
    db.getDb().collection("users").insertOne(user);

    res.redirect("/");
});

router.get("/register", function (req, res) {
    res.locals.isAuth = req.session.isAuth;

    console.log(req.body.password);

    res.render("register");
});

router.post("/register", async function (req, res) {
    // console.log(req.body.password);

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    // console.log(hashedPassword);
    const user = {
        email: req.body.email,
        rollNumber: req.body.rollNumber,
        password: hashedPassword,
        mess: req.body.mess,
    };

    db.getDb().collection("users").insertOne(user);

    res.redirect("/");
});

router.post("/signout", async function (req, res) {
    const id = req.sessionID;
    console.log(id);
    const data = await db.getDb().collection("sessions").find().toArray();
    await db.getDb().collection("sessions").deleteOne({_id: id});
    const data1 = await db.getDb().collection("sessions").findOne({_id: id});
    req.session.isAuth = false;
    res.locals.isAuth = false;
    res.redirect("/");
});

module.exports = router;
