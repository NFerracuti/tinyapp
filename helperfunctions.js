// function to check if a user value exists, and return
// all the user data using the key: either id, email, or password
// returns user object (truthy), or null (falsy)
const userLookup = function(users, key, value) {
  for (let i in users) {
    if (users[i][key] === value) {
      return users[i];
    }
  }
  return null;
};

// check if user's URL by user ID
const urlsForUser = function(id, database) {
  let userUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].user_id === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
};

// function to generate random string of 6 characters for user id
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let counter = 0;
  while (counter < 7) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    counter += 1;
  }
  return result;
};


module.exports = { userLookup, urlsForUser, generateRandomString };