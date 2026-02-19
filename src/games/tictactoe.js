export class TicTacToe {
  constructor(container, controls, gameData, user, profile, onGameEnd) {
    this.container = container;
    this.controls = controls;
    this.gameData = gameData;
    this.user = user;
    this.profile = profile;
    this.onGameEnd = onGameEnd;

    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameActive = false;
    this.score = 0;

    this.init();
  }

  init() {
    this.render();

    this.controls.innerHTML = `
      <button id="start-tictactoe" class="btn-primary btn-large">Start Game</button>
    `;

    document.getElementById('start-tictactoe')?.addEventListener('click', () => {
      this.startGame();
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="tictactoe-game">
        <div class="game-board">
          ${this.board.map((cell, index) => `
            <div class="tictactoe-cell" data-index="${index}">${cell}</div>
          `).join('')}
        </div>
        <div class="game-info">
          <p>Current Player: <span id="current-player">${this.currentPlayer}</span></p>
          <p>Score: <span id="tictactoe-score">${this.score}</span></p>
        </div>
      </div>
    `;
  }

  startGame() {
    this.gameActive = true;
    this.currentPlayer = 'X';
    this.board = ['', '', '', '', '', '', '', '', ''];

    this.controls.innerHTML = `
      <button id="reset-tictactoe" class="btn-secondary">Reset Game</button>
      <button id="end-tictactoe" class="btn-danger">End Game</button>
    `;

    document.getElementById('reset-tictactoe')?.addEventListener('click', () => {
      this.resetGame();
    });

    document.getElementById('end-tictactoe')?.addEventListener('click', () => {
      this.endGame();
    });

    this.render();
    this.attachCellListeners();
  }

  attachCellListeners() {
    const cells = document.querySelectorAll('.tictactoe-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        if (!this.gameActive) return;

        const index = parseInt(e.target.dataset.index);
        if (this.board[index] !== '') return;

        this.makeMove(index);
      });
    });
  }

  makeMove(index) {
    this.board[index] = this.currentPlayer;

    const winner = this.checkWinner();

    if (winner) {
      this.gameActive = false;

      if (winner === 'X') {
        this.score += 100;
      }

      this.render();

      setTimeout(() => {
        if (winner === 'X') {
          alert('You win! +100 points');
          this.resetGame();
        } else if (winner === 'O') {
          alert('Computer wins! Try again.');
          this.resetGame();
        } else {
          alert("It's a draw!");
          this.resetGame();
        }
      }, 100);

      return;
    }

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    this.render();
    this.attachCellListeners();

    if (this.currentPlayer === 'O' && this.gameActive) {
      setTimeout(() => {
        this.computerMove();
      }, 500);
    }
  }

  computerMove() {
    if (!this.gameActive) return;

    const emptyIndices = this.board
      .map((cell, index) => cell === '' ? index : null)
      .filter(index => index !== null);

    if (emptyIndices.length === 0) return;

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    this.makeMove(randomIndex);
  }

  checkWinner() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }

    if (this.board.every(cell => cell !== '')) {
      return 'draw';
    }

    return null;
  }

  resetGame() {
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.render();
    this.attachCellListeners();
  }

  endGame() {
    this.gameActive = false;
    this.onGameEnd(this.gameData, this.user, this.profile, this.score);
  }
}
