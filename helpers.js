const generateRandomString = function () {
  const permittedChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let string = '';
  for (let i = 0; i <= 6; i++) {
    let char = Math.floor(Math.random() * 36);
    string += permittedChars[char];
  }
  return string;
}

const getUserByEmail = function (enteredEmail, database) {
  for (const key in database) {
    if (enteredEmail === database[key].email) {
      return key;
    }
  }
  return;
};

const urlsForUser = function (id, urlDatabase) {
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
  //This just checks if the cookie exists, is that enough?
  if (req.session.user_id) {
    return true;
  }
  return false;
}

const urlIsOwnedByUser = function (req) {
  console.log('req.session.user_id',req.session.user_id);
  const usersURLs = urlsForUser(req.session.user_id); //this is probs broken
  // console.log('usersURLs',usersURLs)
  for (const key in usersURLs) {
    if (req.params.shortURL === key) {
      return true;
    }
  };
  return false;
}

module.exports = {generateRandomString,getUserByEmail, urlsForUser, isLoggedIn, urlIsOwnedByUser}