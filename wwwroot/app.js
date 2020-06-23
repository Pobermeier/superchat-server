console.log('Hello World');

const socket = io();

console.log(socket);

window.onclose = socket.disconnect;

socket.emit('login', { username: 'pobermeier', password: 'Password' });

console.log(socket);

socket.on('error2', ({ msg }) => {
  console.error(msg);
});

socket.on('connected', ({ data }) => {
  console.table(data);
});
