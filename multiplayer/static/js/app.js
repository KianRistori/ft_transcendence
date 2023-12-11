// Create WebSocket connection.
const socket = new WebSocket("ws://localhost:8000");

// Connection opened
socket.addEventListener("open", (event) => {
  let d = document.getElementById("test");
  socket.send(d);
});

// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
});