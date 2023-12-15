let wsURL = `ws://${window.location.host}/ws/socket-server/`;
let chatSocket;

// Function to initiate WebSocket connection
function initWebSocket() {
  chatSocket = new WebSocket(wsURL);

  chatSocket.onopen = function(event) {
    console.log('WebSocket is open and ready.');
    
    // Optionally, you can set up additional logic here after the WebSocket connection is established.
  };

  chatSocket.onmessage = function(e) {
    let data = JSON.parse(e.data)
    console.log('Data:', data)
    if (data.type === 'invitation_received') {
      console.log(`Received an invitation from ${data.sender}. Do you accept?`);
      // Notify the user about the invitation
      // You may choose to display this in your UI or handle it as per your application logic
    } else if (data.type === 'opponent_joined_group') {
      console.log(`${data.user} has joined the group.`);
      // Process the information when the opponent joins the group
    } else {
      console.log("else");
      // Handle other message types if needed
    }
  };

  chatSocket.onclose = function(event) {
    console.log('WebSocket connection closed.');
    // Optionally, you can set up logic for handling closed connections here.
  };

  chatSocket.onerror = function(error) {
    console.error('WebSocket error:', error);
  };
}

// Call the function to initiate the WebSocket connection
initWebSocket();
if (typeof userData !== 'undefined') {
  console.log('Logged in user:', userData.username);
  
  // You can use other properties of userData as needed
} else {
  console.log('User is not logged in.');
}

function inviteFriend(friend_name) {
  let message = 'Invitation message';
  if (chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.send(JSON.stringify({
      'type': 'invitation',
      'sender': userData.username,
      'opponent': friend_name
    }));
  } else {
    console.error('WebSocket is not ready.');
  }
}
/*
let form = document.getElementById('form')
form.addEventListener('submit', (e)=> {
  e.preventDefault()
  let message = e.target.message.value 
  chatSocket.send(JSON.stringify({
    'message':message
  }))
  form.reset()
})*/

// Pong game logic

const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");
const btnStart = document.getElementById("btnStart");
const btnsStatus = document.getElementById("btnsStatus");
const btnStatusPlay = document.getElementById("btnStatusPlay");
const btnStatusPause = document.getElementById("btnStatusPause");
const btnStatusRewind = document.getElementById("btnStatusRewind");

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;

let paddle1Y = canvas.height / 2 - paddleHeight / 2;
let paddle2Y = canvas.height / 2 - paddleHeight / 2;
let paddleSpeed = 5;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

let scorePlayer1 = 0;
let scorePlayer2 = 0;

let isPaused = false;

function draw() {
  
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#41464b";
  context.lineWidth = 2;
  context.strokeRect(0, 0, canvas.width, canvas.height);

  if (!isPaused) {
    // Draw paddles
    context.fillStyle = "#ffffff";
    context.fillRect(20, paddle1Y, paddleWidth, paddleHeight);
    context.fillRect(canvas.width - paddleWidth - 20, paddle2Y, paddleWidth, paddleHeight);

    // Draw the ball
    context.beginPath();
    context.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    context.closePath();

    // Move the ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Bounce off the top and bottom edges
    if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
      ballSpeedY = -ballSpeedY;
    }

    // Check collision with paddles
    if (
      (ballX - ballSize < (paddleWidth + 20) && ballY > paddle1Y && ballY < paddle1Y + paddleHeight) ||
      (ballX + ballSize > canvas.width - (paddleWidth + 20) &&
        ballY > paddle2Y &&
        ballY < paddle2Y + paddleHeight)
    ) {
      ballSpeedX = -ballSpeedX;
    }

    // Check for a point scored
    if (ballX - ballSize < 0) {
      // Player 2 scores
      scorePlayer2++;
      resetBall();
    } else if (ballX + ballSize > canvas.width) {
      // Player 1 scores
      scorePlayer1++;
      resetBall();
    }

    // Move the paddles
    movePaddles();
    chatSocket.send(JSON.stringify({
      'message':paddle1Y,
      'user':userData.username
    }))
  }

  // Display the score
  context.font = "20px Arial";
  context.fillText(scorePlayer1 + " - " + scorePlayer2, canvas.width / 2 - 10, 30);

  // Display pause message
  if (isPaused) {
    context.fillText("Paused", canvas.width / 2 - 30, canvas.height / 2);
  }
}

function movePaddles() {
  // Player 1 controls
  if (keysPressed.ArrowUp && paddle1Y > 0) {
    paddle1Y -= paddleSpeed;
  }
  if (keysPressed.ArrowDown && paddle1Y + paddleHeight < canvas.height) {
    paddle1Y += paddleSpeed;
  }
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
}

// Keyboard input handling
const keysPressed = {};

window.addEventListener("keydown", function (event) {
  keysPressed[event.code] = true;

  // // Pause the game on Space key press
  // if (event.code === "Space") {
  //   isPaused = !isPaused;
  //   if (isPaused) {
  //     btnStatusPause.classList.remove("btn", "btn-outline-secondary");
  //     btnStatusPause.classList.add("btn", "btn-secondary");
  //   }
  //   else if (!isPaused) {
  //     btnStatusPause.classList.remove("btn", "btn-secondary");
  //     btnStatusPause.classList.add("btn", "btn-outline-secondary");
  //   }
  // }
});

window.addEventListener("keyup", function (event) {
  keysPressed[event.code] = false;
});

btnStatusPause.addEventListener("click", function () {
  isPaused = true;

  btnStatusPause.classList.toggle("btn-outline-secondary");
  btnStatusPause.classList.toggle("btn-secondary");
  btnStatusPlay.classList.toggle("btn-secondary");
  btnStatusPlay.classList.toggle("btn-outline-secondary");
});

btnStatusPlay.addEventListener("click", function () {
  isPaused = false;

  btnStatusPause.classList.toggle("btn-outline-secondary");
  btnStatusPause.classList.toggle("btn-secondary");
  btnStatusPlay.classList.toggle("btn-secondary");
  btnStatusPlay.classList.toggle("btn-outline-secondary");
});

// Game loop
function gameLoop() {
  btnStart.remove();
  canvas.style.display = 'block';
  btnsStatus.style.display = 'block';
  draw();
  requestAnimationFrame(gameLoop);
}

btnStart.addEventListener("click", function () {
  gameLoop();
  btnStatusPlay.classList.remove("btn", "btn-outline-secondary");
  btnStatusPlay.classList.add("btn", "btn-secondary");
});

btnStatusRewind.addEventListener("click", function () {
  resetGame();
});

function resetGame() {
  // Reimposta tutte le variabili del gioco al loro stato iniziale
  paddle1Y = canvas.height / 2 - paddleHeight / 2;
  paddle2Y = canvas.height / 2 - paddleHeight / 2;

  resetBall();

  scorePlayer1 = 0;
  scorePlayer2 = 0;

  isPaused = false;
}
