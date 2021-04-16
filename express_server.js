const express = require('express');
const bcrypt = require('bcrypt');
const { generateRandomString, getUserByEmail, urlsForUser, isLoggedIn, urlIsOwnedByUser } = require('./helpers.js')
const cookieSession = require('cookie-session');
const app = express();
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const PORT = 8080;


///Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['secret']
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "12345" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" }
};

///"Database"

//remove these later
const users = {
  "12345": {
    id: "userRandomID",
    email: "user@example.com",
    password: "j"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



///Routes
app.get('/', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  }
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
  // req.session.user_id = retrievedUserID;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  //Redirecting to /urls will ultimately land the logged-out user at /wall because /urls redirects if the user isn't logged in
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('registration', templateVars)
});

app.post('/register', (req, res) => {

  const retrievedUserID = getUserByEmail(req.body.email, users);

  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Email and password cannot be blank');
  }
  if (retrievedUserID) {
    return res.status(400).send('An account with this email already exists');
  }
  const user_id = generateRandomString();
  users[user_id] = {};
  users[user_id].id = user_id;
  users[user_id].email = req.body.email;
  users[user_id].password = bcrypt.hashSync(req.body.password, 10);
  users[user_id].password
  req.session.user_id = user_id;

  res.redirect('/urls');


});

app.get('/urls/new', (req, res) => {
  if (!isLoggedIn(req)) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    user: users[req.session.user_id]
  }

  res.render('urls_new', templateVars);
});


app.get('/wall', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  res.render('wall', templateVars);
});

app.get('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    res.redirect('/wall');
    return;
  }

  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render('urls_index', templateVars);
})

app.post('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    res.redirect('/login');
    return;
  }

  //create new record (new tinyURL) and add all the details to the urlDatabase
  const generatedShort = generateRandomString()
  urlDatabase[generatedShort] = {};
  urlDatabase[generatedShort].longURL = req.body.longURL;
  urlDatabase[generatedShort].user_id = req.session.user_id; //just session?
  res.redirect(`/urls/${generatedShort}`);
})

app.get('/u/:shortURL', (req, res) => {
  //if the shortURL doesn't exist in the database, redirect
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('This tinyURL does not exist');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get('/urls/:shortURL', (req, res) => {
  //If the tiny URL isn't in the database, send a message
  if (!(Object.keys(urlDatabase).includes(req.params.shortURL))) {
    res.status(404).send('Tiny url does not exist');
  };

  if (!isLoggedIn(req)) {
    res.redirect('/wall');
    return;
  }

  if (!urlIsOwnedByUser(req, urlDatabase)) {
    res.status(403).send('You do not have permission to view this page')
    return;
  }


  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render('urls_show', templateVars);

})

app.post('/urls/:id', (req, res) => {
  if (!urlIsOwnedByUser(req, urlDatabase)) {
    res.status(403).send('You do not have permission to view this page')
    return;
  }

  const originalShort = req.params.id;
  urlDatabase[originalShort] = {};
  urlDatabase[originalShort].longURL = req.body.newLongURL;
  urlDatabase[originalShort].user_id = req.session.user_id;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (!isLoggedIn(req)) {
    res.redirect('/wall');
    return;
  }

  if (!urlIsOwnedByUser(req, urlDatabase)) {
    return res.status(403).send('You do not have permission to view this page');
  }

  console.log('urlDatabase before delete', urlDatabase)
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  console.log('urlDatabase after delete', urlDatabase)
  res.redirect('/urls');
});

//what was this about again?
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('*', (req, res) => {
  res.send(404).send('Sorry, this page does not exist');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});