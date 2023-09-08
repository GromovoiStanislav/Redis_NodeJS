const socket = io('http://localhost:3000');

const KEY = '1';

socket.emit('joinRoom', KEY);

console.log('Live');

socket.on('message', (message) => console.log('message', message));
socket.on('history', (data) => console.log('history', JSON.stringify(data)));

const btn = document.querySelector('button');

btn?.addEventListener('click', () => {
  console.log('added');
  socket.emit('message', {
    text: 'Test',
    date: new Date(),
    key: KEY,
  });
});
