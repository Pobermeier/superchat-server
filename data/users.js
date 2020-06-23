const fs = require('fs');
const path = require('path');

const activeUsers = {};

let registeredUsers = {};

const saveRegisteredUsers = () => {
  const data = JSON.stringify(registeredUsers, null, 2);
  fs.writeFileSync(path.join(__dirname, 'registeredUsers.json'), data);
};

const loadRegisteredUsers = () => {
  const data = fs.readFileSync(path.join(__dirname, 'registeredUsers.json'));
  registeredUsers = JSON.parse(data);
};

module.exports = {
  activeUsers,
  registeredUsers,
  saveRegisteredUsers,
  loadRegisteredUsers,
};
