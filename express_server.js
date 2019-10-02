const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

app.set("view engine", "ejs");

const generateRandomString = function() {
  let input = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += input[Math.floor(Math.random() * input.length)]
  }
  return randomString; 
}

function verifyEmail(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

function verifyPassword(email, password) {
  for (let user in users) {
    if (users[user].email === email && users[user].password === password) {
      return users[user].id;
    }
  }
}; 


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
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
  let cookie = req.cookies;
  let templateVars = {
    urls: urlDatabase, 
    user: users[cookie.user_id]
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  let cookie = req.cookies;
  let templateVars = {
    user: users[cookie.user_id],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let cookie = req.cookies;
  let templateVars = {
    user: users[cookie.user_id],
    urls: urlDatabase
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let cookie = req.cookies;
  res.render("login", {user: users[cookie.user_id]});
})

app.post("/urls", (req, res) => {
  const generatedshortURL = generateRandomString();
  urlDatabase[generatedshortURL] = req.body.longURL;
  res.redirect(`/urls/${generatedshortURL}`);
});

app.post("/login", function(req, res) {
  console.log(req.cookies);
  let userID = verifyPassword(req.body.email, req.body.password);
  if (userID) {
    res.cookie(`user_id`, userID);
    res.redirect("/urls")
  } else {
    res.status(403).send(`Error 403 - Email/ Password entered is not valid!`);
  }
});

app.post("/logout", function(req, res) {
  console.log(req.cookies);
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/register", function (req, res) {
  if (verifyEmail(req.body.email)) {
    res.status(400).send(`Error 400 - That email is already in use!`);
  } else if (req.body.email === "" || req.body.password === "") {
    res.status(400).send(`Error 400 - Email or password needs to be entered!`);
  } else {
    let userID = generateRandomString();
    res.cookie(`email`, req.body.email);
    res.cookie(`password`, req.body.password);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password,
    }
    console.log(users);
    res.redirect("/urls");
  }
});


app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
})


app.get("/urls/:shortURL", (req, res) => {
  let cookie = req.cookies;
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],  
    user: users[cookie.user_id] 
  };
  res.render("urls_show.ejs", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
