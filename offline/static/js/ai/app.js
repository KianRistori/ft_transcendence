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
let aiBallX = canvas.width / 2;;
let aiBallY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

let scorePlayer1 = 0;
let scorePlayer2 = 0;

let isPaused = false;
let aiMovementInterval;

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
    aiMovement();
    if (!aiMovementInterval) {
        aiMovementInterval = setInterval(updateAIBall, 1000); // Execute aiMovement() every 1 second
      }
  } else {
    clearInterval(aiMovementInterval); // Clear the interval if the game is paused
    aiMovementInterval = null;
  }

  // Display the score
  context.font = "20px Arial";
  context.fillText(scorePlayer1 + " - " + scorePlayer2, canvas.width / 2 - 10, 30);

  // Display pause message
  if (isPaused) {
    context.fillText("Paused", canvas.width / 2 - 30, canvas.height / 2);
  }
}

function updateAIBall()
{
  aiBallX = ballX;
  aiBallY = ballY;
}

function aiMovement()
{
  console.log("x : " + aiBallX)
  console.log("y : " + aiBallY)
  let paddleCenter = paddle1Y + paddleHeight / 2;

  // Calculate the predicted ball position after reaching the AI's side
  let predictedBallY = aiBallY + ballSpeedY * (canvas.width - aiBallX) / ballSpeedX;

  // Adjust the AI's paddle movement based on the predicted ball position
  if (predictedBallY < paddleCenter - paddleHeight * 0.2) {
    paddle2Y -= paddleSpeed;
  } else if (predictedBallY > paddleCenter + paddleHeight * 0.2) {
    paddle2Y += paddleSpeed;
  }

  // Ensure the paddle stays within the canvas boundaries
  paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
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