const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080;

///Functions (move to module later)
const generateRandomString = function () {
  const permittedChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let string = '';
  for (let i = 0; i <= 6; i++) {
    let char = Math.floor(Math.random() * 36);
    string += permittedChars[char];
  }
  return string;
}

const retrieveUserIDBasedOnEmail = function (enteredEmail, users) {
  for (const key in users) {
    if (enteredEmail === users[key].email) {
      return key;
    }
  }
  return null; //is this the best? many errors in the terminal
}

const urlsForUser = function (id) {
  const usersURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      usersURLs[key] = urlDatabase[key].longURL;
    }
  }
  // console.log('within function usersURLs',usersURLs)
  return usersURLs;
};

const isLoggedIn = function (req) {
  if (req.cookies && Object.keys(req.cookies).length !== 0) {
    return true;
  }
  return false;
}

const urlIsOwnedByUser = function (req) {
  const usersURLs = urlsForUser(req.cookies['user_id']);
  // console.log('usersURLs',usersURLs)
  for (const key in usersURLs) {
    if (req.params.shortURL === key) {
      return true;
    }
  };
  return false;
}

///Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
  // console.log('isloggedin', isLoggedIn(req))
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('login', templateVars);

});

app.post('/login', (req, res) => {
  //if the email doesn't exist in the users object
  const retrievedUserID = retrieveUserIDBasedOnEmail(req.body.email, users);
  if (!retrievedUserID) {
    res.redirect(403, '/register');
    return;
  }

  //if the email or password are wrong
  if (users[retrievedUserID].email !== req.body.email) {
    res.redirect(403, '/register');
    return;
  }
  if (!bcrypt.compareSync(req.body.password, users[retrievedUserID].password)) {
    console.log('bcrypt users', users);
    console.log('bcrypt req.body.password', req.body.password)
    console.log('bcyrpt users[retrievedUserID].password', users[retrievedUserID].password)
    res.redirect(403, '/register');
    return;
  }

  // console.log('retriveduserid', retrievedUserID);
  res.cookie('user_id', retrievedUserID);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  // console.log('individual user',templateVars.user)
  res.render('registration', templateVars)
});

app.post('/register', (req, res) => {

  const retrievedUserID = retrieveUserIDBasedOnEmail(req.body.email, users);

  if (!req.body.email || !req.body.password) {
    res.redirect(400, '/register'); //do something more specific than this? Compass unclear
    return;
  }
  if (retrievedUserID) {
    res.redirect(400, '/register');
    return;
  }
  const user_id = generateRandomString();
  users[user_id] = {};
  users[user_id].id = user_id;
  users[user_id].email = req.body.email;
  users[user_id].password = bcrypt.hashSync(req.body.password, 10);
  users[user_id].password
  // console.log('users object:', users);
  res.cookie('user_id', user_id);
  res.redirect('/urls');
  // console.log('users object', users)

});

app.get('/urls/new', (req, res) => {
  if (!isLoggedIn(req)) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  // console.log(req);
  res.render('urls_new', templateVars);
});


app.get('/wall', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('wall', templateVars);
});

app.get('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    res.redirect('/wall');
    return;
  }

  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlsForUser(req.cookies['user_id'])
  };
  // console.log('templateVars.urls', templateVars.urls);
  res.render('urls_index', templateVars);
})

app.post('/urls', (req, res) => {
  //is this really the right way to prevent people from getting where they shouldn't? I'm in post.
  if (!isLoggedIn(req)) {
    res.redirect('/login');
    return;
  }

  //create new record (new tinyURL) and add all the details to the urlDatabase
  const generatedShort = generateRandomString()
  urlDatabase[generatedShort] = {};
  urlDatabase[generatedShort].longURL = req.body.longURL;
  urlDatabase[generatedShort].user_id = req.cookies.user_id;
  // console.log('urlDatabase',urlDatabase);
  res.redirect(`/urls/${generatedShort}`);
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get('/urls/:shortURL', (req, res) => {

  if (!isLoggedIn(req)) {
    res.redirect('/login');
    return;
  }

  if (!urlIsOwnedByUser(req)) {
    res.redirect('/wall');
    return;
  }

  //
  const templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render('urls_show', templateVars);

})

app.post('/urls/:id', (req, res) => {
  const originalShort = req.params.id;
  // console.log('req.params',req.params);

  urlDatabase[originalShort] = req.body.newLongURL;
  // console.log('new url from form',urlDatabase);
  res.redirect('/urls/' + originalShort);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (!isLoggedIn(req)) {
    res.redirect('/login');
    return;
  }

  //if url doesn't belong to user, redirect them--this might not be ultimate solution
  if (!urlIsOwnedByUser(req)) {
    res.redirect('/wall');
    return;
  }

  // console.log('urlDatabase before delete', urlDatabase)
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  // console.log('urlDatabase after delete', urlDatabase)
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});