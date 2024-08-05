/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Kyle Homen Student ID: 105669238 Date: 2024-08-05
*
*  Published URL: https://lego-site.vercel.app/
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const authData = require('./modules/auth-service');

const path = require('path');
const express = require('express');
const clientSessions = require('client-sessions');
const app = express();

require("pg");
const Sequelize = require("sequelize");

const HTTP_PORT = process.env.PORT || 8080;

app.use(clientSessions({
    cookieName: 'session',
    secret: "web322_A6_kjsfhkajhfkajhkjhk1208479287",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
};

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended:true}));

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get("/lego/sets", async (req, res) => {
    let sets = [];
    try {
        if (req.query.theme) {
            sets = await legoData.getSetsByTheme(req.query.theme);
        }
        else {
            sets = await legoData.getAllSets();
        }

        res.render("sets", {sets})
    }
    catch (err) {
        res.status(404).render("404", {message: err});
    }
});

app.get("/lego/sets/:num", async (req, res) => {
    try {
        let set = await legoData.getSetByNum(req.params.num);
        res.render("set", {set});
    }
    catch (err) {
        res.status(404).render("404", {message: err});
    }
});

app.get("/lego/addSet", ensureLogin, async (req, res) => {
    let themes = await legoData.getAllThemes();
    res.render("addSet", {themes: themes});
});

app.post("/lego/addSet", ensureLogin, async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        res.render("500", {message: `I'm sorry, but we've encountered the following error: ${err}`});
    }
});

app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
    try {
        let set = await legoData.getSetByNum(req.params.num);
        let themes = await legoData.getAllThemes();

        res.render("editSet", {set, themes});
    } catch (err) {
        res.status(404).render("404", {message: err});
    }
});

app.post("/lego/editSet", ensureLogin, async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        res.render("500", {message: `I'm sorry, but we've encountered the following error: ${err}`});
    }
});

app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
    try {
        await legoData.deleteSet(req.params.num);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(500).render("500", {message: `I'm sorry, but we've encountered the following error: ${err}`});
    }
});

app.get("/login", (req, res) => {
    res.render("login", {errorMessage: "", username: ""});
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');

    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }

        res.redirect('/lego/sets');
    }).catch((err) => {
        res.render("login", {errorMessage: err, username: req.body.userName});
    });
});

app.get("/register", (req, res) => {
    res.render("register", {errorMessage: "", successMessage: "", username: ""});
});

app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render("register", {errorMessage:"", successMessage: "User created", userName: ""});
    }).catch((err) => {
        res.render("register", {errorMessage: err, successMessage: "", userName: req.body.userName});
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

app.use((req, res, next) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
  });

legoData.initialize().then(authData.initialize).then(()=>{
    app.listen(HTTP_PORT, () => {console.log(`server listening on: ${HTTP_PORT}`)});
}).catch(err => {
    console.log(err);
});