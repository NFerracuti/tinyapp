const { assert } = require('chai');

const { userLookup } = require('../helperfunctions.js');

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

describe('userLookup', function() {
  it('should return a user with valid email', function() {
    const user = userLookup(testUsers, "email", "user@example.com");
    const userID = user.id;
    const expectedUserID = "userRandomID";
    assert.equal(userID, expectedUserID);
  });
  it('should return undefined with missing email', function() {
    const user = userLookup(testUsers, "email", "notanemail@example.com");
    const expectedReturn = undefined;
    assert.equal(user, expectedReturn);
  });
});
