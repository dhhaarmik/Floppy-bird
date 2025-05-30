const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const countdown = document.getElementById('countdown');
const highscoreDisplay = document.getElementById('highscore-display');
const celebrationPopup = document.getElementById('celebration-popup');

let birdY, velocity, gravity, isGameOver, score, pipeSpeed, pipeGap;
let pipeInterval;
let pipes = [];
let animationId = null;

let highScore = localStorage.getItem('flappyHighScore') || 0;
highscoreDisplay.innerText = `High Score: ${highScore}`;

document.removeEventListener('keydown', flap);
document.removeEventListener('touchstart', flap);

document.addEventListener('keydown', flap);
document.addEventListener('touchstart', flap);

startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  startCountdown();
});

restartBtn.addEventListener('click', () => {
  restartBtn.style.display = 'none';
  resetGame();
  startCountdown();
});

function startCountdown() {
  let counter = 3;
  countdown.innerText = counter;
  countdown.style.display = 'block';

  const interval = setInterval(() => {
    counter--;
    countdown.innerText = counter;
    if (counter === 0) {
      clearInterval(interval);
      countdown.style.display = 'none';
      startGame();
    }
  }, 1000);
}

function startGame() {
  bird.style.display = 'block';
  scoreDisplay.style.display = 'block';

  birdY = window.innerHeight / 2;
  velocity = 0;
  gravity = 0.5;
  isGameOver = false;
  score = 0;
  pipeSpeed = 2;
  pipeGap = 200;

  bird.style.top = `${birdY}px`;
  scoreDisplay.innerText = `Score: ${score}`;

  createPipe();
  pipeInterval = setInterval(createPipe, 2000);
  animationId = requestAnimationFrame(gameLoop);
}

function createPipe() {
  const pipeTop = document.createElement('div');
  const pipeBottom = document.createElement('div');

  const dynamicGap = Math.max(120, pipeGap - score * 3);
  const pipeHeight = Math.floor(Math.random() * (window.innerHeight - dynamicGap - 200)) + 50;

  pipeTop.classList.add('pipe', 'top');
  pipeBottom.classList.add('pipe', 'bottom');

  pipeTop.style.height = `${pipeHeight}px`;
  pipeBottom.style.height = `${window.innerHeight - pipeHeight - dynamicGap}px`;

  let pipeX = window.innerWidth;
  pipeTop.style.left = `${pipeX}px`;
  pipeBottom.style.left = `${pipeX}px`;

  gameContainer.appendChild(pipeTop);
  gameContainer.appendChild(pipeBottom);

  const pipeObj = { pipeTop, pipeBottom, pipeX, passed: false };
  pipes.push(pipeObj);

  function movePipe() {
    if (isGameOver) return;

    pipeObj.pipeX -= pipeSpeed;
    pipeTop.style.left = `${pipeObj.pipeX}px`;
    pipeBottom.style.left = `${pipeObj.pipeX}px`;

    if (pipeObj.pipeX + 80 < 0) {
      pipeTop.remove();
      pipeBottom.remove();
      pipes = pipes.filter(p => p !== pipeObj);
      return;
    }

    if (
      pipeObj.pipeX < 140 && pipeObj.pipeX + 80 > 100 &&
      (bird.offsetTop < pipeTop.offsetHeight ||
        bird.offsetTop + 40 > window.innerHeight - pipeBottom.offsetHeight)
    ) {
      endGame();
    }

    if (pipeObj.pipeX + pipeSpeed < 100 && !pipeObj.passed) {
      pipeObj.passed = true;
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
      if (score % 5 === 0) pipeSpeed += 0.5;
    }

    requestAnimationFrame(movePipe);
  }

  requestAnimationFrame(movePipe);
}

function gameLoop() {
  if (isGameOver) return;

  velocity += gravity;
  birdY += velocity;
  bird.style.top = `${birdY}px`;

  if (birdY < 0 || birdY + 40 > window.innerHeight) {
    endGame();
    return;
  }

  animationId = requestAnimationFrame(gameLoop);
}

function flap() {
  if (!isGameOver) velocity = -8;
}

function endGame() {
  isGameOver = true;
  clearInterval(pipeInterval);
  cancelAnimationFrame(animationId);
  restartBtn.style.display = 'block';

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('flappyHighScore', highScore);
    highscoreDisplay.innerText = `High Score: ${highScore}`;
    showCelebration();
  }
}

function resetGame() {
  clearInterval(pipeInterval);
  cancelAnimationFrame(animationId);

  pipes.forEach(p => {
    p.pipeTop.remove();
    p.pipeBottom.remove();
  });
  pipes = [];

  isGameOver = false;
  score = 0;
  pipeSpeed = 2;
  birdY = window.innerHeight / 2;
  velocity = 0;
  bird.style.top = `${birdY}px`;
  scoreDisplay.innerText = `Score: 0`;
}

function showCelebration() {
  celebrationPopup.style.display = 'block';
  setTimeout(() => {
    celebrationPopup.style.display = 'none';
  }, 2000);
}
