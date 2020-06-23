const fs = require('fs').promises;
const path = require('path');

const loggedInUsers = {};

const registeredUsers = {};

const saveRegisteredUsers = async () => {
  await fs.writeFile(
    path.join(__dirname, 'registeredUsers.json'),
    JSON.stringify(registeredUsers),
  );
};

const loadRegisteredUsers = async () => {
  const data = await fs.readFile(path.join(__dirname, 'registeredUsers.json'));
  registeredUsers = data;
};

module.exports = {
  loggedInUsers,
  registeredUsers,
  saveRegisteredUsers,
  loadRegisteredUsers,
};
