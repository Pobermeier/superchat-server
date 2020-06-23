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
    res.status(200).json({ status: 'success', data });
    console.log('All active users: ', JSON.stringify(activeUsers));
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
    !registeredUsers[username] ||
    !registeredUsers[username].password === password
  ) {
    res
      .status(404)
      .json({ status: 'error', msg: 'Wrong username or password' });
  } else if (activeUsers[username]) {
    res.status(404).json({ status: 'error', msg: 'User is already logged-in' });
  } else {
    activeUsers[username] = {};
    activeUsers[username].username = registeredUsers[username].username;
    activeUsers[username].status = registeredUsers[username].status;
    activeUsers[username].img = registeredUsers[username].img;

    res
      .status(200)
      .json({ status: 'success', msg: 'You successfully logged-in' });
    console.log('All active users: ', JSON.stringify(activeUsers));
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
    delete activeUsers[userToDelete];
    res.status(200).json({
      status: 'success',
      msg: 'User successfully removed from active-user list',
    });
    console.log('All active users: ', JSON.stringify(activeUsers));
  }
});

app.use(express.static(path.resolve(__dirname, 'wwwroot')));

const server = app.listen(PORT, () => {
  console.log('App listening on port ' + PORT);
});

const io = socketio(server);

io.on('connection', (socket) => {
  const state = {
    isAuthenticated: false,
    socketId: null,
    username: null,
  };

  console.log('New connection with socket ID: ', socket.id);

  socket.on('login', (username, password) => {
    if (!username || !password) {
      socket.emit('error', { status: 'error', msg: 'Invalid data' });
    } else if (
      !registeredUsers[username] ||
      !registeredUsers[username].password === password
    ) {
      socket.emit('error', {
        status: 'error',
        msg: 'Wrong username or password',
      });
    } else if (activeUsers[username]) {
      socket.emit('error', {
        status: 'error',
        msg: 'User is already logged-in',
      });
    } else {
      state.socketId = socket.id;
      state.username = username;

      activeUsers[state.username] = {
        username: registeredUsers[state.username].username,
        status: registeredUsers[state.username].status,
        img: registeredUsers[state.username].img,
        socketId: state.socketId,
      };

      state.isAuthenticated = true;
      socket.emit('connected', {
        status: 'success',
        data: Object.values(activeUsers),
      });
      socket.broadcast.emit('newConnection', Object.values(activeUsers));
    }
  });

  socket.on('disconnect', () => {
    if (state.isAuthenticated && activeUsers && activeUsers[state.username]) {
      delete activeUsers[state.username];
    }
  });
});

process.on('SIGINT', () => {
  saveRegisteredUsers();
  process.exit();
});

process.on('exit', () => {
  saveRegisteredUsers();
});
