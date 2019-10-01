const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

app.set("view engine", "ejs");

let templateVars = {
  username: req.cookies["username"],
  shortURL: req.params.shortURL,
  longURL: urlDatabase[req.params.shortURL],
  urls: urlDatabase

  // ... any other vars
};
res.render("urls_index", templateVars);

const generateRandomString = function() {
  var input = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var randomString = '';
  for (var i = 0; i < 6; i++) {
    randomString += input[Math.floor(Math.random() * input.length)]
  }
  return randomString; 
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "abcdef": "http://www.rotoworld.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", function(req, res) {
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  let username = {username: req.cookies["username"]};
  res.render("urls_new", username);
});

app.post("/login", function(req, res) {
  console.log(req.body.username);
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", function(req, res) {
  res.clearCookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const generatedshortURL = generateRandomString();
  urlDatabase[generatedshortURL] = req.body.longURL;
  res.redirect(`/urls/${generatedshortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
})


app.get("/urls/:shortURL", (req, res) => {
  res.render("urls_show.ejs", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});