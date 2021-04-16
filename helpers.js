const generateRandomString = function () {
  const permittedChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let string = '';
  for (let i = 0; i <= 5; i++) {
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
  // console.log('')
  // console.log('urlsforuser function starts')
  const usersURLs = {};
  // console.log('id',id);
  for (const key in urlDatabase) {
    // console.log('key', key)
    if (urlDatabase[key].user_id === id) {
      // console.log('urlDatabase[key].user_id',urlDatabase[key].user_id)
      usersURLs[key] = urlDatabase[key].longURL;
    }
  }
  // console.log('within function usersURLs',usersURLs)
  // console.log('urlsforuser function ends')
  // console.log('')
  return usersURLs;
};

const isLoggedIn = function (req) {
  if (req.session.user_id) {
    return true;
  }
  return false;
}
//don't pass in req for next time
const urlIsOwnedByUser = function (req,urlDatabase) {
  // console.log('req.session.user_id',req.session.user_id);
  // console.log('urlsForUser(req.session.user_id)',urlsForUser(req.session.user_id));
  // console.log('req.params.shortURL',req.params.shortURL);
  const usersURLs = urlsForUser(req.session.user_id, urlDatabase); //this is probs broken

  for (const key in usersURLs) {
    console.log('on loop key',key)
    if (req.params.shortURL === key) {
      return true;
    }
  };
  return false;
}

module.exports = {generateRandomString,getUserByEmail, urlsForUser, isLoggedIn, urlIsOwnedByUser}