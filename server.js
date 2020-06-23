const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const {
  loadRegisteredUsers,
  saveRegisteredUsers,
  activeUsers,
  registeredUsers,
} = require('./data/users');
const User = require('./models/User');

// Load user data from JSON-file and put it into memory
loadRegisteredUsers();

// Init Express
const app = express();
const PORT = process.env.PORT || 5008;

// Init express middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ROUTES

// Get active users
app.get('/users', (req, res) => {
  if (!activeUsers) {
    res.status(500).json({ status: 'error', msg: 'Internal server error' });
  } else {
    const data = Object.values(activeUsers);
    res.status(200).json({ status: 'success', data: JSON.stringify(data) });
    console.log('All active users: ', JSON.stringify(data));
  }
});

// Create new user
app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const avatarImg = req.body.avatarImg || '';
  const statement = req.body.statement;

  if (!username || !password || !statement) {
    res.status(404).json({ status: 'error', msg: 'Invalid data' });
  } else if (registeredUsers[username]) {
    res.status(404).json({ status: 'error', msg: 'User already exists' });
  } else {
    const newUser = new User(username, password, avatarImg, statement);
    registeredUsers[username] = newUser;
    res
      .status(200)
      .json({ status: 'success', msg: 'User successfully created' });
    console.log('User added: ', newUser);
    console.log('All registered users: ', registeredUsers);
  }
});

// Login existing user - Add to active-user list
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(404).json({ status: 'error', msg: 'Invalid data' });
  } else if (
    !registeredUsers[username].username === username ||
    !registeredUsers[username].password === password
  ) {
    res
      .status(404)
      .json({ status: 'error', msg: 'Wrong username or password' });
  } else if (activeUsers[username]) {
    res.status(404).json({ status: 'error', msg: 'User is already logged-in' });
  } else {
    activeUsers[username].username = registeredUsers[username].username;
    activeUsers[username].status = registeredUsers[username].status;
    activeUsers[username].img = registeredUsers[username].img;

    res
      .status(200)
      .json({ status: 'success', msg: 'You successfully logged-in' });
    console.log('All active users: ', JSON.stringify(data));
  }
});

// Remove user from active user list
app.delete('/users/:username', (req, res) => {
  const userToDelete = req.params.username;
  if (!activeUsers[userToDelete]) {
    res.status(500).json({
      status: 'error',
      msg: 'This id does not correspond to a valid user',
    });
  } else {
    res.status(200).json({
      status: 'success',
      msg: 'User successfully removed from active-user list',
    });
    console.log('All active users: ', JSON.stringify(data));
  }
});

app.use(express.static(path.resolve(__dirname, 'wwwroot')));

app.listen(PORT, () => {
  console.log('App listening on port ' + PORT);
});

process.on('SIGINT', () => {
  saveRegisteredUsers();
  process.exit();
});

process.on('exit', () => {
  saveRegisteredUsers();
});
