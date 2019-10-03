const bcrypt = require("bcrypt");


const generateRandomString = function() {
  let input = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    randomString += input[Math.floor(Math.random() * input.length)];
  }
  return randomString;
};

function verifyEmail(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return undefined;
};

function verifyPassword(email, password) {
  for (let user in users) {
    if (users[user].email === email) {
      return bcrypt.compareSync(password, users[user].password);
    }
  }
};

function userVerification(object, id) {
  let returned = {};
  for (let obj in object) {
    if (object[obj].userID == id) {
      returned[obj] = object[obj];
    }
  }
  return returned;
};

module.exports = {
  generateRandomString,
  verifyEmail,
  verifyPassword,
  userVerification
};