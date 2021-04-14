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

const checkIfEmailAlreadyHasAccount = function(enteredEmail,users) {
  for (const key in users) {
   if (enteredEmail === users[key].email){
     return true;
   }
  }
return false;
};

const checkPassword = function(enteredEmail,enteredPassword,users) {
  for (const key in users) {
    if (enteredEmail === users[key].email && enteredPassword === users[key].password){
      return true;
    }
   }
 return false;
 };


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

console.log('checking password, should return true:',checkPassword("user@example.com","purple-monkey-dinosaur",users))

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/login', (req,res)=>{
res.render('login');

});

app.post('/login', (req, res) => {
  // res.cookie('username',req.body.username);
  // console.log('rescookie',res.cookie);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  // res.clearCookie('user_id');
  res.redirect('/urls');
  //problem is here somewhere--logout fails if statement in partial
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  // console.log('individual user',templateVars.user)
  res.render('registration', templateVars)
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.redirect(400,'/register'); //do something more specific than this? Compass unclear
  } else if (checkIfEmailAlreadyHasAccount(req.body.email,users)) {
    res.redirect(400,'/register');
  }  else {
    const userID = generateRandomString();
    users[userID] = {};
    users[userID].id = userID;
    users[userID].email = req.body.email;
    users[userID].password = req.body.password;
    console.log('users object:', users); //to test with cURL: curl -X POST -i localhost:8080/register -d "username=vanillaice&&password=ladeda"
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
  console.log('users object',users)

});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  }
  // console.log(req);
  res.render('urls_new', templateVars);
});


app.get('/urls', (req, res) => {
  // console.log('request',req.cookies);
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };

  res.render('urls_index', templateVars);
})

app.post('/urls', (req, res) => {
  const generatedShort = generateRandomString()
  urlDatabase[generatedShort] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${generatedShort}`);
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]
  };
  // console.log('longURL:', templateVars.longURL);
  // console.log('shortURL:',templateVars.shortURL);
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