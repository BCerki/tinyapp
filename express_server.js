const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = 8080;

const generateRandomString = function () {
  const permittedChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let string = '';
  for (let i = 0; i <= 6; i++) {
    // let characterCode = Math.floor(Math.random()*26) + 65;
    // let char = String.fromCharCode(characterCode);
    // string += char;
    let char = Math.floor(Math.random() * 36);
    string += permittedChars[char];
  }
  return string;
}
// console.log('randomstring', generateRandomString());

const checkIfEmailAlreadyHasAccount = function (enteredEmail, users) {
  for (const key in users) {
    if (enteredEmail === users[key].email) {
      return true;
    }
  }
  return false;
};

const retrieveUserIDBasedOnEmail = function (enteredEmail, users) {
  for (const key in users) {
    if (enteredEmail === users[key].email) {
      return key;
    }
  }
  return null; //is this the best? many errors in the terminal
}

const urlsForUser = function(id) {
  const usersURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      usersURLs[key] = urlDatabase[key].longURL;
    }
  }
  return usersURLs;
};


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "12345" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

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

// console.log('checking password, should return true:',checkPassword("user@example.com","purple-monkey-dinosaur",users))

// console.log('lookup check, shoudl be userRandomID', retrieveUserID('user@example.com', users));

console.log('urlsforuser',urlsForUser('12345'));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('login',templateVars);

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
  if (users[retrievedUserID].password !== req.body.password) {
    res.redirect(403, '/register');
    return; //could probs combine this with above
  }
  console.log('retriveduserid', retrievedUserID);
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
    users[user_id].password = req.body.password;
    console.log('users object:', users);
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  console.log('users object', users)

});

app.get('/urls/new', (req, res) => {
  if (Object.keys(req.cookies).length === 0) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  // console.log(req);
  res.render('urls_new', templateVars);
});


app.get('/wall', (req,res)=> {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render('wall', templateVars);
});

app.get('/urls', (req, res) => {
  if (Object.keys(req.cookies).length === 0) {
    res.redirect('/wall');
    return;
  }
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlsForUser(req.cookies['user_id'])
  };
console.log('templateVars.urls',templateVars.urls);
  res.render('urls_index', templateVars);
})

app.post('/urls', (req, res) => {
  const generatedShort = generateRandomString()
  //changed both of these before I noticed cookie issue
  urlDatabase[generatedShort] = {};
  urlDatabase[generatedShort].longURL = req.body.longURL;
  urlDatabase[generatedShort].user_id = req.cookies.user_id;
  res.redirect(`/urls/${generatedShort}`);
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get('/urls/:shortURL', (req, res) => {
  //if user isn't logged in, redirect them
  if (Object.keys(req.cookies).length === 0) {
    res.redirect('/login');
    return;
  }
  //if url doesn't belong to user, redirect them
  
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
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
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