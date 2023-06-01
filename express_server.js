const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// function to generate random string of 6 characters
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let counter = 0;
  while (counter < 7) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    counter += 1;
  }
  return result;
};

// function to check if a user value exists. key can only be id, email, or password
// returns full object (truthy), or null (falsy)
const userLookup = function(key, value) {
  for (let i in users) {
    if (users[i][key] === value) {
      return users[i];
    }
  }
  return null;
};

// USERS OBJECT
const users = {
  pppppp: {
    id: "nick",
    email: "n@n.com",
    password: "1234",
  },
  llllll: {
    id: "bob",
    email: "b@b.com",
    password: "5678",
  },
};

// URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// GETS START HERE

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    urls: urlDatabase, 
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    user,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user,
  }
  res.render("login", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user
  };
  res.render("urls_show", templateVars);
});



// POSTS START HERE

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();

  if (email.length < 1 || password.length < 1) {
    res
    .status(400)
    .send("Error status 400, both email and password must contain a value.");
  } else if (userLookup("email", email)) {
    res
    .status(400)
    .send("Error status 400, email already exists in system.");
  } else {
    users[id] = {
      "id": id,
      "email": email,
      "password": password,
    };
    res
      .status(201)
      .cookie("user_id", id)
      .redirect(301, '/urls');
  };
});

app.post("/login", (req, res) => {
  // use the userlookup function to grab the user id associateed with email
  const email = req.body.email;
  const password = req.body.password;
  let userObj = userLookup("email", email);
  const id = userObj.id;
  res
    .status(201)
    .cookie("user_id", id)
    .redirect(301, '/urls');
});

app.post("/loginbutton", (req, res) => {
  res.redirect(`/login`);
});

app.post("/registerbutton", (req, res) => {
  res.redirect(`/register`);
});

app.post("/logout", (req, res) => {
  const user_id = req.cookies.user_id;
  res
    .clearCookie('user_id', user_id)
    .redirect(301, '/login');
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/edit", (req, res) => {
  const id = req.body.id;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.updatedURL
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});


// LISTEN ROUTE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});