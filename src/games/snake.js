export class Snake {
  constructor(container, controls, gameData, user, profile, onGameEnd) {
    this.container = container;
    this.controls = controls;
    this.gameData = gameData;
    this.user = user;
    this.profile = profile;
    this.onGameEnd = onGameEnd;

    this.canvas = null;
    this.ctx = null;
    this.snake = [];
    this.food = {};
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.score = 0;
    this.gameActive = false;
    this.gameLoop = null;

    this.gridSize = 20;
    this.tileCount = 20;

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="snake-game">
        <canvas id="snake-canvas" width="400" height="400"></canvas>
        <div class="game-info">
          <p>Score: <span id="snake-score">0</span></p>
          <p>Use Arrow Keys to move</p>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.controls.innerHTML = `
      <button id="start-snake" class="btn-primary btn-large">Start Game</button>
    `;

    document.getElementById('start-snake')?.addEventListener('click', () => {
      this.startGame();
    });
  }

  startGame() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.score = 0;
    this.gameActive = true;

    this.placeFood();

    this.controls.innerHTML = `
      <button id="end-snake" class="btn-danger">End Game</button>
    `;

    document.getElementById('end-snake')?.addEventListener('click', () => {
      this.endGame();
    });

    document.addEventListener('keydown', this.handleKeyPress.bind(this));

    this.gameLoop = setInterval(() => {
      this.update();
    }, 100);
  }

  handleKeyPress(e) {
    if (!this.gameActive) return;

    const key = e.key;

    if (key === 'ArrowUp' && this.direction !== 'DOWN') {
      this.nextDirection = 'UP';
    } else if (key === 'ArrowDown' && this.direction !== 'UP') {
      this.nextDirection = 'DOWN';
    } else if (key === 'ArrowLeft' && this.direction !== 'RIGHT') {
      this.nextDirection = 'LEFT';
    } else if (key === 'ArrowRight' && this.direction !== 'LEFT') {
      this.nextDirection = 'RIGHT';
    }
  }

  update() {
    if (!this.gameActive) return;

    this.direction = this.nextDirection;

    const head = { ...this.snake[0] };

    if (this.direction === 'UP') head.y--;
    else if (this.direction === 'DOWN') head.y++;
    else if (this.direction === 'LEFT') head.x--;
    else if (this.direction === 'RIGHT') head.x++;

    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }

    for (const segment of this.snake) {
      if (segment.x === head.x && segment.y === head.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      document.getElementById('snake-score').textContent = this.score;
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#4CAF50';
    for (const segment of this.snake) {
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }

    this.ctx.fillStyle = '#FF5722';
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }

  placeFood() {
    this.food = {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount)
    };

    for (const segment of this.snake) {
      if (segment.x === this.food.x && segment.y === this.food.y) {
        this.placeFood();
        break;
      }
    }
  }

  gameOver() {
    this.gameActive = false;
    clearInterval(this.gameLoop);

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);

    setTimeout(() => {
      this.endGame();
    }, 2000);
  }

  endGame() {
    this.gameActive = false;
    clearInterval(this.gameLoop);
    this.onGameEnd(this.gameData, this.user, this.profile, this.score);
  }
}
