const { assert } = require('chai');

const {generateRandomString,getUserByEmail, urlsForUser, isLoggedIn, urlIsOwnedByUser} = require('../helpers.js');

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