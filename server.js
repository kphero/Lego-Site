/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Kyle Homen Student ID: 105669238 Date: 2024-07-04
*
*  Published URL: https://lego-site.vercel.app/
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const path = require('path');
const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

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

app.use((req, res, next) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
  });

// After sets is populated, THEN we listen for port
legoData.initialize().then(()=>{
    app.listen(HTTP_PORT, () => {console.log(`server listening on: ${HTTP_PORT}`)})
});