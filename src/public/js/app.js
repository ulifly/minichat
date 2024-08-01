const socket = io({
  auth: {
    serverOffset: 0,
    username: getUsername()
  }
});

const form = document.getElementById('form');
const input = document.getElementById('input');


function getUsername () {
  const username = localStorage.getItem('username');
  if (username) {
    console.log(username);
    return username;
  }else {
  const newUsername = prompt('Please enter a username');
  localStorage.setItem('username', newUsername)
 }
}


socket.on('chat message', (msg, serverOffset, username)=>{
  // const item = document.createElement('li');
  // item.textContent = msg;
  // messages.appendChild(item);
  const item = `<li>
  <small>${username} dice</small>
  <p> ${msg} </p> <small>
  </li>`
  messages.insertAdjacentHTML('beforeend', item);
  socket.auth.serverOffset = serverOffset;
  window.scrollTo(0, document.body.scrollHeight);
})


form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});