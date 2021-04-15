const { assert } = require('chai');

const {generateRandomString,getUserByEmail, urlsForUser, isLoggedIn, urlIsOwnedByUser} = require('../helpers.js');

//test object provided by Compass for checking getUserByEmail
const testUsers = {
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
};

//My test objects for other functions
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "12345" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" }
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

const req = {
  session: {
    user_id: '12345'
  },
  params: {
    shortURL: 'b6UTxQ'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if the user isn\'t in the database', function() {
    const user = getUserByEmail("user1@example.com", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an object that contains all the urls that belong to the user', function() {
    const url = urlsForUser('12345',urlDatabase);
    const expectedOutput = {b6UTxQ: "https://www.tsn.ca"};
    assert.deepEqual(url, expectedOutput);
  });
});

describe('urlIsOwnedByUser', function() {
  it('should return true if url is owned (created) by user', function() {
    const owned = urlIsOwnedByUser(req,urlDatabase);
    const expectedOutput = true;
    assert.equal(owned, expectedOutput);
  });

  
});




//template
// describe('', function() {
//   it('', function() {
//     const thing = 0;
//     const expectedOutput = "userRandomID";
//     assert.equal(thing, expectedOutput);
//   });

  
// });