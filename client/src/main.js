import io from 'socket.io-client';

const socket = io.connect('http://localhost:3000');


socket.on('message', message => {
  store.dispatch(actions.addMessage(message));
});
