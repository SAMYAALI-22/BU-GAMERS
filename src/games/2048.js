export class Game2048 {
  constructor(container, controls, gameData, user, profile, onGameEnd) {
    this.container = container;
    this.controls = controls;
    this.gameData = gameData;
    this.user = user;
    this.profile = profile;
    this.onGameEnd = onGameEnd;

    this.grid = [];
    this.score = 0;
    this.gameActive = false;

    this.init();
  }

  init() {
    this.render();

    this.controls.innerHTML = `
      <button id="start-2048" class="btn-primary btn-large">Start Game</button>
    `;

    document.getElementById('start-2048')?.addEventListener('click', () => {
      this.startGame();
    });
  }

  startGame() {
    this.grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    this.score = 0;
    this.gameActive = true;

    this.addNewTile();
    this.addNewTile();

    this.controls.innerHTML = `
      <button id="end-2048" class="btn-danger">End Game</button>
    `;

    document.getElementById('end-2048')?.addEventListener('click', () => {
      this.endGame();
    });

    document.addEventListener('keydown', this.handleKeyPress.bind(this));

    this.render();
  }

  handleKeyPress(e) {
    if (!this.gameActive) return;

    let moved = false;

    if (e.key === 'ArrowUp') {
      moved = this.moveUp();
    } else if (e.key === 'ArrowDown') {
      moved = this.moveDown();
    } else if (e.key === 'ArrowLeft') {
      moved = this.moveLeft();
    } else if (e.key === 'ArrowRight') {
      moved = this.moveRight();
    }

    if (moved) {
      this.addNewTile();
      this.render();

      if (!this.canMove()) {
        this.gameOver();
      }
    }
  }

  moveLeft() {
    let moved = false;

    for (let i = 0; i < 4; i++) {
      const row = this.grid[i].filter(val => val !== 0);

      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          this.score += row[j];
          row.splice(j + 1, 1);
        }
      }

      while (row.length < 4) {
        row.push(0);
      }

      if (JSON.stringify(row) !== JSON.stringify(this.grid[i])) {
        moved = true;
      }

      this.grid[i] = row;
    }

    return moved;
  }

  moveRight() {
    this.grid = this.grid.map(row => row.reverse());
    const moved = this.moveLeft();
    this.grid = this.grid.map(row => row.reverse());
    return moved;
  }

  moveUp() {
    this.grid = this.transpose(this.grid);
    const moved = this.moveLeft();
    this.grid = this.transpose(this.grid);
    return moved;
  }

  moveDown() {
    this.grid = this.transpose(this.grid);
    this.grid = this.grid.map(row => row.reverse());
    const moved = this.moveLeft();
    this.grid = this.grid.map(row => row.reverse());
    this.grid = this.transpose(this.grid);
    return moved;
  }

  transpose(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
  }

  addNewTile() {
    const empty = [];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.grid[i][j] === 0) {
          empty.push({ i, j });
        }
      }
    }

    if (empty.length > 0) {
      const { i, j } = empty[Math.floor(Math.random() * empty.length)];
      this.grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  canMove() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.grid[i][j] === 0) return true;

        if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return true;
        if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return true;
      }
    }

    return false;
  }

  render() {
    const getTileColor = (value) => {
      const colors = {
        0: '#cdc1b4',
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
      };
      return colors[value] || '#3c3a32';
    };

    this.container.innerHTML = `
      <div class="game-2048">
        <div class="game-info">
          <p>Score: <span id="2048-score">${this.score}</span></p>
          <p>Use Arrow Keys to move</p>
        </div>
        <div class="grid-2048">
          ${this.grid.map(row => `
            <div class="grid-row">
              ${row.map(cell => `
                <div class="grid-cell" style="background: ${getTileColor(cell)}; color: ${cell > 4 ? '#fff' : '#776e65'}">
                  ${cell > 0 ? cell : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  gameOver() {
    this.gameActive = false;
    alert('Game Over! No more moves available.');
    this.endGame();
  }

  endGame() {
    this.gameActive = false;
    this.onGameEnd(this.gameData, this.user, this.profile, this.score);
  }
}
