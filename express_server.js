const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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

app.post("/nu", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  users[id] = {
    "id": id,
    "email": email,
    "password": password,
  };
  res
    .status(201)
    .cookie("user_id", id)
    .redirect(301, '/urls');
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  res
    .status(201)
    .cookie("username", username)
    .redirect(301, '/urls');
});

app.post("/logout", (req, res) => {
  const username = req.body.username;

  res
    .clearCookie('username', username)
    .redirect(301, '/urls');
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();

  urlDatabase[id] = longURL;

  res.redirect(`/urls/${id}`);
});

app.post("/e", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});