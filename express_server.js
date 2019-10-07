const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const saltRounds = 10;
const {generateRandomString, verifyEmail, verifyPassword, userVerification} = require("./helper");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys:["cowboys"],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

//Database of URLs 

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// User Database

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  }
};

//Default Homepage

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//A log of URLS created

app.get("/urls", function(req, res) {
  let cookie = req.session;
  let templateVars = {
    urls: userVerification(urlDatabase, cookie.user_id),
    user: users[cookie.user_id]
  };
  res.render("urls_index", templateVars);
});

//generate new URL

app.get("/urls/new", (req, res) => {
  let cookie = req.session;
  if (cookie.user_id) {
    res.render("urls_new", {user: users[cookie.user_id]});
  } else {
    res.redirect("/login");
  }
});

// Registration Page

app.get("/register", (req, res) => {
  let cookie = req.session;
  let templateVars = {
    user: users[cookie.user_id],
    urls: userVerification(urlDatabase, cookie.user_id)
  };
  res.render("register", templateVars);
});

// Login Page

app.get("/login", (req, res) => {
  let cookie = req.session;
  res.render("login", {user: users[cookie.user_id]});
});

// Link from short URL to Actual URL redirect

app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL].longURL);
});

// Place at the bottom so /urls/everything else will run:

app.get("/urls/:shortURL", (req, res) => {
  let cookie = req.session;
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[cookie.user_id]
  };
  res.render("urls_show.ejs", templateVars);
});

// Create new Short URL and assign string

app.post("/urls", (req, res) => {
  const generatedshortURL = generateRandomString();
  let cookie = req.session;
  urlDatabase[generatedshortURL] = {
    longURL: req.body.longURL,
    userID: cookie.user_id
  };
  res.redirect(`/urls/${generatedshortURL}`);
});

// Login page and process

app.post("/login", function(req, res) {

  let loginemail = req.body.email;
  let loginpassword = req.body.password;
  let user = verifyEmail(loginemail, users);
  let passwordCheck = verifyPassword(loginemail, loginpassword, users);

  if (user && passwordCheck) {
    req.session.user_id = user;
  } else {
    res.render("error", {ErrorStatus: 403, ErrorMessage: "The Email or Password entered is not valid!"});
  }
  res.redirect("/urls");
});



// Logout

app.post("/logout", function(req, res) {
  console.log(req.cookies);
  req.session = null;
  res.redirect("/urls");
});

// Creating/Registering a new user

app.post("/register", function(req, res) {
  if (req.body.email === "" || req.body.password === "") {
    res.render("error", {ErrorStatus: 400, ErrorMessage: "Please fill out all the forms"}); 
  } else if (verifyEmail(req.body.email, users)) {
    res.render("error", {ErrorStatus: 400, ErrorMessage: "That email is already in use!"});
  } else {
    let userID = generateRandomString();
    req.session.user_id = userID;
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
  }
  console.log(users)
  res.redirect("/urls");
});



// ability to edit short URL

app.post("/urls/:shortURL/edit", (req, res) => {
  let cookie = req.session;
  let shortURL = req.params.shortURL;
  let usersObj = userVerification(urlDatabase, cookie.user_id);
  if (usersObj[shortURL]) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: cookie.user_id
    };
    res.redirect("/urls");
  } else {
    res.status(403).send("Please log in to have access to the feature");
  }
});

// 

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

// Ability to delete posts

app.post("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  let cookie = req.session;
  let userLinks = userVerification(urlDatabase, cookie.user_id);
  if (userLinks[short]) {
    delete urlDatabase[short];
    res.redirect("/urls");
  } else {
    res.send("You are not authorized to delete this link.");
  }
});

//Launch Server

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
