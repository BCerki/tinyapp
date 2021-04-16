const generateRandomString = function() {
  const permittedChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  for (let i = 0; i <= 5; i++) {
    let char = Math.floor(Math.random() * 36);
    string += permittedChars[char];
  }
  return string;
};

const getUserByEmail = function(enteredEmail, database) {
  for (const key in database) {
    if (enteredEmail === database[key].email) {
      return key;
    }
  }
  return;
};

const urlsForUser = function(id, urlDatabase) {
  const usersURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      usersURLs[key] = urlDatabase[key].longURL;
    }
  }
  return usersURLs;
};

const isLoggedIn = function(req) {
  if (req.session.user_id) {
    return true;
  }
  return false;
};

const urlIsOwnedByUser = function(req,urlDatabase) {
  

  const usersURLs = urlsForUser(req.session.user_id, urlDatabase);
  for (const key in usersURLs) {
    if (req.params.shortURL === key) {
      return true;
    }
  }
  return false;
  
};

module.exports = {generateRandomString,getUserByEmail, urlsForUser, isLoggedIn, urlIsOwnedByUser};