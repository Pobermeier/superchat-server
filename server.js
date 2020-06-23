const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5008;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(express.static(path.resolve(__dirname, 'wwwroot')));

app.listen(PORT, () => {
  console.log('App listening on port ' + PORT);
});
