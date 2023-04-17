const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;
const SEGMENT_SIZE = 10;
const MOVE_INTERVAL = 100; // milliseconds

let playerName = '';
let playerScore = 0;
let playerLives = 3;
let gameStartTime = 0;
let gameEndTime = 0;
let gameRunning = false;

let playerX = 0;
let playerY = 0;
let playerDirection = 'right';
let playerSegments = [];
let lastMoveTime = 0;

let foodX = 0;
let foodY = 0;

let movementIntervalId;
let escapeIntervalId;

const startForm = document.querySelector('#start-form');
const playerNameInput = document.querySelector('#name-input');
const playerNameDisplay = document.querySelector('#player-name');
const gameTimeDisplay = document.querySelector('#game-time');
const playerScoreDisplay = document.querySelector('#player-score');
const playerLivesDisplay = document.querySelector('#player-lives');

const gameOverScreen = document.querySelector('.game-over-screen');
const gameOverNameDisplay = document.querySelector('#game-over-name');
const gameOverTimeDisplay = document.querySelector('#game-over-time');
const gameOverScoreDisplay = document.querySelector('#game-over-score');
const restartButton = document.querySelector('#restart-button');
const exitButton = document.querySelector('#exit-button');

/*
 * Game Initialization Functions
 */

function initGame() {
   resetGame();
   drawPlayerSegments();
   drawFood();
   playerNameDisplay.textContent = playerName;
   startGameTimer();
}

function resetGame() {
   playerX = 0;
   playerY = 0;
   playerDirection = 'right';
   playerSegments = [];
   playerScore = 0;
   playerLives = 3;
   lastMoveTime = 0;
   gameStartTime = 0;
   gameEndTime = 0;
   gameRunning = false;

   generateFoodPosition();
   drawPlayerSegments();
   drawFood();

   playerScoreDisplay.textContent = playerScore;
   playerLivesDisplay.textContent = playerLives;
   gameTimeDisplay.textContent = '00:00';

   hideScreens();
   showScreen('.game-screen');
}

function hideScreens() {
   const screens = document.querySelectorAll('.game-screen');
   screens.forEach(screen => (screen.style.display = 'none'));
}

function showScreen(screenClass) {
   const screen = document.querySelector(screenClass);
   screen.style.display = 'flex';
}

function startGameTimer() {
   gameStartTime = new Date().getTime();
   gameTimeDisplay.textContent = '00:00';

   const gameInterval = setInterval(() => {
      if (!gameRunning) {
         clearInterval(gameInterval);
         return;
      }

      const elapsedTime = new Date().getTime() - gameStartTime;
      const minutes = Math.floor(elapsedTime / 1000 / 60);
      const seconds = Math.floor(elapsedTime / 1000) % 60;
      gameTimeDisplay.textContent = `${padNumber(minutes)}:${padNumber(
         seconds,
      )}`;
   }, 1000);
}

function generateFoodPosition() {
   foodX = Math.floor(Math.random() * (SCREEN_WIDTH / SEGMENT_SIZE - 1) + 1) * SEGMENT_SIZE;
   foodY = Math.floor(Math.random() * (SCREEN_HEIGHT / SEGMENT_SIZE - 1) + 1) * SEGMENT_SIZE;

   for (let i = 0; i < playerSegments.length; i++) {
      if (foodX === playerSegments[i].x && foodY === playerSegments[i].y) {
         generateFoodPosition(); // generate a new position if the food is under the snake
         break;
      }
   }
}

function drawPlayerSegments() {
   ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

   ctx.fillStyle = '#428bca';
   playerSegments.forEach(segment => {
      ctx.fillRect(segment.x, segment.y, SEGMENT_SIZE, SEGMENT_SIZE);
   });
}

function drawFood() {
   ctx.fillStyle = '#d9534f';
   ctx.fillRect(foodX, foodY, SEGMENT_SIZE, SEGMENT_SIZE);
}

/*
 * Game Over Functions
 */

function endGame() {
   gameRunning = false;
   gameEndTime = new Date().getTime();
   clearInterval(movementIntervalId);
   clearInterval(escapeIntervalId);

   if (playerLives <= 0) {
      endGameScreen();
   } else {
      playerLives--;
      playerLivesDisplay.textContent = playerLives;
      setTimeout(() => {
         resetGame();
      }, MOVE_INTERVAL);
   }
}

function endGameScreen() {
   hideScreens();
   showScreen('.game-over-screen');

   gameOverNameDisplay.textContent = playerName;
   gameOverTimeDisplay.textContent = gameTimeDisplay.textContent;
   gameOverScoreDisplay.textContent = playerScore;

   clearInterval(movementIntervalId);
}

function restartGame() {
   resetGame();
}

function exitGame() {
   resetGame();
   hideScreens();
   showScreen('.start-screen');
}

/*
 * Movement Functions
 */

function movePlayer() {
   const currentTime = new Date().getTime();

   if (currentTime - lastMoveTime < MOVE_INTERVAL) {
      return;
   }

   lastMoveTime = currentTime;

   switch (playerDirection) {
      case 'up':
         playerY -= SEGMENT_SIZE;
         break;
      case 'right':
         playerX += SEGMENT_SIZE;
         break;
      case 'down':
         playerY += SEGMENT_SIZE;
         break;
      case 'left':
         playerX -= SEGMENT_SIZE;
         break;
   }

   // Check for collision with wall or own segments
   if (playerX < 0 || playerX >= SCREEN_WIDTH || playerY < 0 || playerY >= SCREEN_HEIGHT) {
      endGame();
      return;
   }

   for (let i = 0; i < playerSegments.length; i++) {
      if (playerX === playerSegments[i].x && playerY === playerSegments[i].y) {
         endGame();
         return;
      }
   }

   // Check for collision with food
   if (playerX === foodX && playerY === foodY) {
      playerScore += 10;
      playerScoreDisplay.textContent = playerScore;
      generateFoodPosition();
      drawFood();
      createNewPlayerSegment();
   }

   // Move the last segment to the front and update coordinates
   playerSegments.unshift({ x: playerX, y: playerY });
   playerSegments.pop();

   // Redraw the snake
   drawPlayerSegments();
}

function createNewPlayerSegment() {
   const lastSegment = playerSegments[playerSegments.length - 1];

   switch (playerDirection) {
      case 'up':
         playerSegments.push({ x: lastSegment.x, y: lastSegment.y + SEGMENT_SIZE });
         break;
      case 'right':
         playerSegments.push({ x: lastSegment.x - SEGMENT_SIZE, y: lastSegment.y });
         break;
      case 'down':
         playerSegments.push({ x: lastSegment.x, y: lastSegment.y - SEGMENT_SIZE });
         break;
      case 'left':
         playerSegments.push({ x: lastSegment.x + SEGMENT_SIZE, y: lastSegment.y });
         break;
   }
}

/*
 * Input Functions
 */

document.addEventListener('keydown', e => {
   if (e.code === 'ArrowUp' && playerDirection !== 'down') {
      playerDirection = 'up';
   } else if (e.code === 'ArrowRight' && playerDirection !== 'left') {
      playerDirection = 'right';
   } else if (e.code === 'ArrowDown' && playerDirection !== 'up') {
      playerDirection = 'down';
   } else if (e.code === 'ArrowLeft' && playerDirection !== 'right') {
      playerDirection = 'left';
   }
});

startForm.addEventListener('submit', e => {
   e.preventDefault();
   playerName = playerNameInput.value.trim() || 'Player';
   initGame();
});

restartButton.addEventListener('click', () => {
   restartGame();
});

exitButton.addEventListener('click', () => {
   exitGame();
});

/*
 * Utility Functions
 */

function padNumber(num) {
   return num.toString().padStart(2, '0');
}
