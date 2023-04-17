const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;
const SEGMENT_SIZE = 10;
const MOVE_INTERVAL = 100; // milliseconds

let playerName = "";
let playerScore = 0;
let playerLives = 3;
let gameStartTime = 0;
let gameEndTime = 0;
let gameRunning = false;

let playerX = 0;
let playerY = 0;
let playerDirection = "right";
let playerSegments = [];
let lastMoveTime = 0;

let foodX = 0;
let foodY = 0;

let movementIntervalId;
let escapeIntervalId;

const startForm = document.querySelector("#start-form");
const playerNameInput = document.querySelector("#name-input");
const playerNameDisplay = document.querySelector("#player-name");
const gameTimeDisplay = document.querySelector("#game-time");
const playerScoreDisplay = document.querySelector("#player-score");
const playerLivesDisplay = document.querySelector("#player-lives");

const gameOverScreen = document.querySelector(".game-over-screen");
const gameOverNameDisplay = document.querySelector("#game-over-name");
const gameOverTimeDisplay = document.querySelector("#game-over-time");
const gameOverScoreDisplay = document.querySelector("#game-over-score");
const restartButton = document.querySelector("#restart-button");
const exitButton = document.querySelector("#exit-button");

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
   playerDirection = "right";
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
   gameTimeDisplay.textContent = "00:00";

   hideScreens();
   showScreen(".game-screen");
}

function hideScreens() {
   const screens = document.querySelectorAll(".game-screen");
   screens.forEach((screen) => (screen.style.display = "none"));
}

function showScreen(screenClass) {
   const screen = document.querySelector(screenClass);
   screen.style.display = "flex";
}

function startGameTimer() {
   gameStartTime = new Date().getTime();
   gameTimeDisplay.textContent = "00:00";

   const gameInterval = setInterval(() => {
      if (!gameRunning)