// Pong game logic
const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");


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
  context.strokeStyle = "#EAFF00";
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

  // Pause the game on Space key press
  if (event.code === "Space") {
    isPaused = !isPaused;
  }
});

window.addEventListener("keyup", function (event) {
  keysPressed[event.code] = false;
});

// Game loop
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
