var roomCode = document.getElementById("game_board").getAttribute("room_code");
var h1HeadingVS = document.getElementById("headingVS");

var connectionString = 'ws://' + window.location.host + '/ws/play/' + roomCode + '/';
var gameSocket = new WebSocket(connectionString);

const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");
const btnStart = document.getElementById("btnStart");
const btnsStatus = document.getElementById("btnsStatus");

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

let host = false;

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
    if (host) {
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      gameSocket.send(JSON.stringify({
        "event": "BALL_MOVE",
        "ballX": ballX,
        "ballY": ballY,
      }));
    }

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
      if (host) {
        scorePlayer2++;
        if (scorePlayer2 == 6) {
          gameSocket.send(JSON.stringify({
            "event": "END",
            "message": "PLAYER2",
            "scorePlayer1": scorePlayer1,
            "scorePlayer2": scorePlayer2,
          }));
        }
        gameSocket.send(JSON.stringify({
          "event": "SCORE_PLAYER2",
          "message": scorePlayer2,
        }));
      }
      resetBall();
    } else if (ballX + ballSize > canvas.width) {
      // Player 1 scores
      if (host) {
        scorePlayer1++;
        if (scorePlayer1 == 6) {
          gameSocket.send(JSON.stringify({
            "event": "END",
            "message": "PLAYER1",
            "scorePlayer1": scorePlayer1,
            "scorePlayer2": scorePlayer2,
          }));
        }
        gameSocket.send(JSON.stringify({
          "event": "SCORE_PLAYER1",
          "message": scorePlayer1,
        }));
      }
      resetBall();
    }

    // Move the paddles
    movePaddles();
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
  if (host) {
    if (keysPressed.ArrowUp && paddle1Y > 0) {
      paddle1Y -= paddleSpeed;
      gameSocket.send(JSON.stringify({
        "event": "MOVE_PLAYER1",
        "message": paddle1Y,
      }));
    }

    if (keysPressed.ArrowDown && paddle1Y + paddleHeight < canvas.height) {
      paddle1Y += paddleSpeed;
      gameSocket.send(JSON.stringify({
        "event": "MOVE_PLAYER1",
        "message": paddle1Y,
      }));
    }
  } else {
    if (keysPressed.ArrowUp && paddle2Y > 0) {
      paddle2Y -= paddleSpeed;
      gameSocket.send(JSON.stringify({
        "event": "MOVE_PLAYER2",
        "message": paddle2Y,
      }));
    }

    if (keysPressed.ArrowDown && paddle2Y + paddleHeight < canvas.height) {
      paddle2Y += paddleSpeed;
      gameSocket.send(JSON.stringify({
        "event": "MOVE_PLAYER2",
        "message": paddle2Y,
      }));
    }
  }
}

function resetBall() {
  if (host) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
    gameSocket.send(JSON.stringify({
      "event": "BALL_RESET",
      "ballX": ballX,
      "ballY": ballY,
    }));
  }
}

// Keyboard input handling
const keysPressed = {};

window.addEventListener("keydown", function (event) {
  keysPressed[event.code] = true;
});

window.addEventListener("keyup", function (event) {
  keysPressed[event.code] = false;
});

// Game loop
function gameLoop() {
  canvas.style.display = 'block';
  draw();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  // Reimposta tutte le variabili del gioco al loro stato iniziale
  paddle1Y = canvas.height / 2 - paddleHeight / 2;
  paddle2Y = canvas.height / 2 - paddleHeight / 2;

  resetBall();

  scorePlayer1 = 0;
  scorePlayer2 = 0;

  isPaused = false;
}

let playerNumber = 0;

function connect() {
  gameSocket.onopen = function open() {
      console.log('WebSockets connection created.');
      // on websocket open, send the START event.
      gameSocket.send(JSON.stringify({
          "event": "START",
          "message": ""
      }));
  };

  gameSocket.onclose = function (e) {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function () {
          connect();
      }, 1000);
  };
  // Sending the info about the room
  gameSocket.onmessage = function (e) {
      // On getting the message from the server
      // Do the appropriate steps on each event.
      let data = JSON.parse(e.data);
      data = data["payload"];
      let message = data['message'];
      let event = data["event"];
      let ballXRecived = data["ballX"];
      let ballYRecived = data["ballY"];
      console.log(event);
      switch (event) {
          case "START":
              resetGame();
              break;
          case "STARTGAME":
              gameLoop();
              break;
          case "END":
              alert(message);
              resetGame();
              window.location.href = "/online/";
              break;
          case "HOST":
              host = true;
              break;
          case "MOVE_PLAYER1":
              paddle1Y = message;
              break;
          case "MOVE_PLAYER2":
              paddle2Y = message;
              break;
          case "BALL_MOVE":
              ballX = ballXRecived;
              ballY = ballYRecived;
              break;
          case "BALL_RESET":
                ballX = ballXRecived;
                ballY = ballYRecived;
                break;
          case "VS_HEADING":
              h1HeadingVS.innerHTML = message;
              break;
          case "SCORE_PLAYER1":
              scorePlayer1 = message;
              break;
          case "SCORE_PLAYER2":
              scorePlayer2 = message;
              break;
          default:
              console.log("No event")
      }
  };

  if (gameSocket.readyState == WebSocket.OPEN) {
      gameSocket.onopen();
  }
}

connect();