///Modules
const express = require('express');
const bcrypt = require('bcrypt');
const { generateRandomString, getUserByEmail, urlsForUser, isLoggedIn, urlIsOwnedByUser } = require('./helpers.js');
const cookieSession = require('cookie-session');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;


///Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret']
}));

///"Databases"
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "12345" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" }
};

const users = {};


///Routes
app.get('/', (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const retrievedUserID = getUserByEmail(req.body.email, users);

  if (!retrievedUserID || users[retrievedUserID].email !== req.body.email) {
    return res.status(403).send('The email or password is incorrect');

  }
  if (!bcrypt.compareSync(req.body.password, users[retrievedUserID].password)) {
    return res.status(403).send('The email or password is incorrect');
  }
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  //Redirecting to /urls will ultimately land the logged-out user at /wall because /urls redirects logged-out users
  req.session = null
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('registration', templateVars);
});

app.post('/register', (req, res) => {
  const retrievedUserID = getUserByEmail(req.body.email, users);

  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Email and password cannot be blank');
  }
  if (retrievedUserID) {
    return res.status(400).send('An account with this email already exists');
  }

  //Add new user to the database using the form-submitted information
  const user_id = generateRandomString();
  users[user_id] = {};
  users[user_id].id = user_id;
  users[user_id].email = req.body.email;
  users[user_id].password = bcrypt.hashSync(req.body.password, 10);
  req.session.user_id = user_id;

  res.redirect('/urls');


});

app.get('/urls/new', (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };

  res.render('urls_new', templateVars);
});

//Create an endpoint to send users to if they try to access something while not logged in
app.get('/wall', (req, res) => {
  res.render('wall');
});

app.get('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/wall');
  }

  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/login');
  }

  //Create new record (new tinyURL) and add all the details to the urlDatabase
  const generatedShort = generateRandomString();
  urlDatabase[generatedShort] = {};
  urlDatabase[generatedShort].longURL = req.body.longURL;
  urlDatabase[generatedShort].user_id = req.session.user_id;
  res.redirect(`/urls/${generatedShort}`);
});

app.get('/u/:shortURL', (req, res) => {
  //If the shortURL doesn't exist in the database (possibly because the user typed it wrong), advise user
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('This tinyURL does not exist. If you think it should, please verify that the long URL is spelled correctly and includes http:// or https://');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get('/urls/:shortURL', (req, res) => {
  //If the tiny URL isn't in the database, advise user
  if (!(Object.keys(urlDatabase).includes(req.params.shortURL))) {
    res.status(404).send('Tiny url does not exist');
  }

  if (!isLoggedIn(req)) {
    return res.redirect('/wall');
  }
  if (!urlIsOwnedByUser(req, urlDatabase)) {
    return res.status(403).send('You do not have permission to view this page');
  }

  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  //Give req.params.shortURL a value so when urlIsOwnedByUser uses it, it's defined (since here the path uses :id instead of :shortURL)
  req.params.shortURL = req.params.id;
  if (!urlIsOwnedByUser(req, urlDatabase)) {
    return res.status(403).send('You do not have permission to view this page');
  }

  //Link an existing short URL to a new user-specified long URL
  const originalShort = req.params.id;
  urlDatabase[originalShort] = {};
  urlDatabase[originalShort].longURL = req.body.newLongURL;
  urlDatabase[originalShort].user_id = req.session.user_id;

  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/wall');
  }

  if (!urlIsOwnedByUser(req, urlDatabase)) {
    return res.status(403).send('You do not have permission to delete this url');
  }

  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];

  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/*', (req, res) => {
  res.status(404).send('Sorry, this page does not exist');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});