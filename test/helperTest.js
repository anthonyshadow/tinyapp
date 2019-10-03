const { assert } = require('chai');

const { verifyEmail } = require('../helper.js');

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

describe('verifyEmail', function() {
  it('should return a user with valid email', function() {
    const user = verifyEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });
  it('should return a undefined if we pass an email that does not exist in our user database', function() {
    const user = verifyEmail("example@email.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user);
  });
});
