const socket = io('http://localhost:3000');

const message = document.getElementById('message');
const messages = document.getElementById('messages');
const chatTitle = document.querySelector('h1');

function updateLiWidth() {
  messages.style.width = message.offsetWidth + 'px';
}
setInterval(updateLiWidth, 100);

const CONNECTION_COUNT_UPDATED_CHANNEL = 'chat:connection-count-updated';
const NEW_MESSAGE_CHANNEL = 'chat:new-message';

const handleSubmitNewMessage = () => {
  socket.emit(NEW_MESSAGE_CHANNEL, { message: message.value });
  message.value = '';
};

socket.on(NEW_MESSAGE_CHANNEL, (msg) => {
  console.log(msg);
  handleNewMessage(msg);
});

socket.on(CONNECTION_COUNT_UPDATED_CHANNEL, ({ count }) => {
  chatTitle.textContent = `Chat (${count})`;
});

const handleNewMessage = (message) => {
  messages.appendChild(buildNewMessage(message));

  messages.scrollTop = messages.scrollHeight + 1000;
};

const buildNewMessage = (message) => {
  const li = document.createElement('li');

  // li.appendChild(document.createTextNode(JSON.stringify(message)));

  // li.innerHTML = `
  //   <p>${message.id}</p>
  //   <p>${message.createdAt}</p>
  //   <p>${message.port}</p>
  //   <p>${message.message}</p>
  // `;

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message-wrapper');

  const paragraph = document.createElement('p');
  paragraph.innerHTML = `
    ${message.id}<br>
    ${message.createdAt}<br>
    ${message.message}
  `;
  messageDiv.appendChild(paragraph);
  li.appendChild(messageDiv);

  return li;
};
