// Pong game logic
const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");
const btnStart = document.getElementById("btnStart");
const btnsStatus = document.getElementById("btnsStatus");
const btnStatusPlay = document.getElementById("btnStatusPlay");
const btnStatusPause = document.getElementById("btnStatusPause");
const btnStatusRewind = document.getElementById("btnStatusRewind");
const h1TextVS = document.getElementById("textVS");

let matchups = JSON.parse(localStorage.getItem("matchups"));
let players = JSON.parse(localStorage.getItem("players"));
let winPoints = localStorage.getItem('winPoints');

h1TextVS.innerHTML = `${matchups[0][0]} VS ${matchups[0][1]}`;

let gameOver = false;

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

  if (!isPaused && !gameOver) {
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
    if (scorePlayer2 == winPoints) {
      // Player 2 wins, game over
      endGame(matchups[0][1], matchups[0][0]);
    } else {
      resetBall();
    }
  } else if (ballX + ballSize > canvas.width) {
    // Player 1 scores
    scorePlayer1++;
    if (scorePlayer1 == winPoints) {
      // Player 1 wins, game over
      endGame(matchups[0][0], matchups[0][1]);
    } else {
      resetBall();
    }
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
  if (keysPressed.ArrowUp && paddle1Y > 0) {
    paddle1Y -= paddleSpeed;
  }
  if (keysPressed.ArrowDown && paddle1Y + paddleHeight < canvas.height) {
    paddle1Y += paddleSpeed;
  }

  // Player 2 controls
  if (keysPressed.KeyW && paddle2Y > 0) {
    paddle2Y -= paddleSpeed;
  }
  if (keysPressed.KeyS && paddle2Y + paddleHeight < canvas.height) {
    paddle2Y += paddleSpeed;
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
  draw();
  requestAnimationFrame(gameLoop);
}

btnStart.addEventListener("click", function () {
  btnStart.remove();
  canvas.style.display = 'block';
  btnsStatus.style.display = 'block';
  btnStatusPlay.classList.remove("btn", "btn-outline-secondary");
  btnStatusPlay.classList.add("btn", "btn-secondary");
  gameLoop();
});

btnStatusRewind.addEventListener("click", function () {
  resetGame();
});

function resetGame() {
  paddle1Y = canvas.height / 2 - paddleHeight / 2;
  paddle2Y = canvas.height / 2 - paddleHeight / 2;

  resetBall();

  scorePlayer1 = 0;
  scorePlayer2 = 0;

  isPaused = false;
}

function removePlayerFromArray(array, playerName) {
    // Trova l'indice del giocatore nell'array
    const playerIndex = array.indexOf(playerName);
  
    // Se l'indice è trovato, rimuovi il giocatore dall'array
    if (playerIndex !== -1) {
      array.splice(playerIndex, 1);
    }
  }

function endGame(winner, loser) {
  gameOver = true;
  removePlayerFromArray(players, loser);
  matchups.shift();
  alert(`${winner} wins! Game over.`);
  history.go(-1);
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('matchups', JSON.stringify(matchups));
}