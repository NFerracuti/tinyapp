const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");  // for hashing passwords

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['ferracuti'],
}));

//require helper functions
const { userLookup, urlsForUser, generateRandomString } = require('./helperfunctions');

// USERS OBJECT
const users = {}

// URL DATABASE
const urlDatabase = {};

//-----------------------------------------------
// GETS START HERE
//-----------------------------------------------

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Home Page - displays your URLs
//---------------------------
app.get("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const urls = urlsForUser(user_id, urlDatabase);
  const templateVars = { 
    urls,
    user,
  };
  res.render("urls_index", templateVars);
});

// Create a new URL page
//---------------------------
app.get("/urls/new", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const templateVars = { 
    user
  };
  if (!user_id) {
    res.render("login", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }
});

// Register new user page
//---------------------------
app.get("/register", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const templateVars = { 
    user,
  };
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// Login page
//---------------------------
app.get("/login", (req, res) => {
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const templateVars = {
    user,
  }
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

// Actual redirection page to bring you to the long URL input
//---------------------------
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const targetUrlObj = urlDatabase[id];
  if (!targetUrlObj) {
    return res
    .status(404)
    .end("Error 404: URL ID not found");
  };
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("404: Tiny URL not found");
  }
});

// Page for each new URL
//---------------------------
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session["user_id"];
  const user = users[user_id];
  const userUrls = urlsForUser(user_id, urlDatabase);
  const targetUrlObj = urlDatabase[id];

  if (!targetUrlObj) {
    return res
    .status(404)
    .end("Error 404: URL ID not found");
  };
  const longURL = urlDatabase[id].longURL;

  const templateVars = {
    id: req.params.id,
    longURL,
    user,
  };

  if (!urlDatabase[id]) {
    res.status(404).send('error 404: this short url does not exist.');
  } else if (!user_id || !userUrls[id]) {
    res.status(401).send('error 401: not your URL!');
  } else {
    res.render('urls_show', templateVars);
  }
});


//-----------------------------------------------
// POSTS START HERE
//-----------------------------------------------

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email.length < 1 || password.length < 1) {
    res
    .status(400)
    .send("Error status 400, both email and password must contain a value.");
  } else if (userLookup(users, "email", email)) {
    res
    .status(400)
    .send("Error status 400, email already exists in system.");
  } else {
    users[id] = {
      "id": id,
      "email": email,
      "hashedPassword": hashedPassword,
    };
    req.session.user_id = id;
    res
    .status(201)
    .redirect(301, '/urls');
  };
});

// login page submission post
//---------------------------
app.post("/login", (req, res) => {
  // use the userlookup function to grab the user id associateed with email
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const userObj = userLookup(users, "email", inputEmail);
  const password = req.body.password;
  const hashedPassword = userObj.hashedPassword;

  // edge case for logging in with a non-registered email
  if (!userLookup(users, "email", inputEmail)) {
    res.status(404).send("404: No user registered under that email.");

  // for wrong password
  } else if (!bcrypt.compareSync(password, hashedPassword)) {
    res
    .status(401)
    .send("401: Wrong password!");
  } else {
    const id = userObj.id;
    req.session.user_id = id;
    res
    .status(201)
    .redirect(301, '/urls');
  };
});

// login button in header
//---------------------------
app.post("/loginbutton", (req, res) => {
    res.redirect(`/login`);
});

// register button in header
//---------------------------
app.post("/registerbutton", (req, res) => {
  res.redirect(`/register`);
});

// logout button in header
//---------------------------
app.post("/logout", (req, res) => {
  req.session = null
  res
    .redirect(301, '/login');
});


app.post("/urls", (req, res) => {
  const user_id = req.session["user_id"];
  let longURL = req.body.longURL;

  if (!longURL.startsWith("http://")) {
    longURL = `https://${longURL}`
  };
  
  const id = generateRandomString();
  urlDatabase[id] = {
  "longURL": longURL,
  "user_id": user_id,
  };

  if (!user_id) {
    res.send("Only registered users can shorten URLs.")
  } else {
    res.redirect(`/urls/${id}`);
  }
});

// edit button on URLs page
//---------------------------
app.post("/edit", (req, res) => {
  const id = req.body.id;
  res.redirect(`/urls/${id}`);
});

// delete button on URLs page
//---------------------------
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.session["user_id"];
  const userUrls = urlsForUser(user_id, urlDatabase);

  //ensures the user is logged in, owns the url, and the url exists
  if (!user_id || !userUrls[id] || !id) {
    return res.status(401).send('error 401: unauthorized action');
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

// update button on new url page
//---------------------------
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.updatedURL
  urlDatabase[id].longURL = longURL;
  res.redirect(`/urls/${id}`);
});

//---------------------------
// LISTEN ROUTE
//---------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});