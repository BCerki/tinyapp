const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;

const generateRandomString = function() {
  const permittedChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let string = '';
  for (let i = 0; i <= 6; i++) {
    // let characterCode = Math.floor(Math.random()*26) + 65;
    // let char = String.fromCharCode(characterCode);
    // string += char;
    let char = Math.floor(Math.random()*36);
    string += permittedChars[char];
  }
  return string;
}
// console.log('randomstring', generateRandomString());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('OK');
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
})

app.get('/urls/:shortURL', (req,res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  // console.log('longURL:', templateVars.longURL);
  // console.log('shortURL:',templateVars.shortURL);
  res.render('urls_show', templateVars);

})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello',(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});