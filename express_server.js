const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: true}));

//app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys:["cowboys"],
  maxAge: 24 * 60 * 60 * 1000
}));


app.set("view engine", "ejs");

const generateRandomString = function() {
  let input = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += input[Math.floor(Math.random() * input.length)];
  }
  return randomString;
};

function verifyEmail(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
}

function verifyPassword(email, password) {
  for (let user in users) {
    if (users[user].email === email) {
      return bcrypt.compareSync(password, users[user].password);
    }
  }
}

function userVerification(object, id) {
  let returned = {};
  for (let obj in object) {
    if (object[obj].userID == id) {
      returned[obj] = object[obj];
    }
  }
  return returned;
}


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
/*
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});
*/

app.get("/urls", function(req, res) {
  let cookie = req.session;
  let templateVars = {
    urls: userVerification(urlDatabase, cookie.user_id),
    user: users[cookie.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let cookie = req.session;
  if (cookie.user_id) {
    res.render("urls_new", {user: users[cookie.user_id]});
  } else {
    res.redirect("/login");
  }
});
app.get("/register", (req, res) => {
  let cookie = req.session;
  let templateVars = {
    user: users[cookie.user_id],
    urls: userVerification(urlDatabase, cookie.user_id)
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let cookie = req.session;
  res.render("login", {user: users[cookie.user_id]});
});

app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL].longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  let cookie = req.session;
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[cookie.user_id]
  };
  res.render("urls_show.ejs", templateVars);
});

app.post("/urls", (req, res) => {
  const generatedshortURL = generateRandomString();
  let cookie = req.session;
  urlDatabase[generatedshortURL] = {
    longURL: req.body.longURL,
    userID: cookie.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${generatedshortURL}`);
});

app.post("/login", function(req, res) {
  console.log(req.cookies);
  let userID = verifyEmail(req.body.email);
  let password = verifyPassword(req.body.email, req.body.password);
  console.log(userID, password);
  if (userID && password) {
    req.session.user_id = userID;
    //res.cookie(`email`, req.body.email);
    res.redirect("/urls");
  } else {
    res.status(403).send(`Error 403 - Email/ Password entered is not valid!`);
  }
});

app.post("/logout", function(req, res) {
  console.log(req.cookies);
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", function(req, res) {
  if (verifyEmail(req.body.email)) {
    res.status(400).send(`Error 400 - That email is already in use!`);
  } else if (req.body.email === "" || req.body.password === "") {
    res.status(400).send(`Error 400 - Email or password needs to be entered!`);
  } else {
    let userID = generateRandomString();
    req.session.user_id = userID;
    //res.cookie(`email`, req.body.email);
    // req.session.password = password;
    //res.cookie(`password`, req.body.password);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
  }
  console.log(users);
  res.redirect("/urls");
});


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
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
