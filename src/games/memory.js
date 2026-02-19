export class MemoryMatch {
  constructor(container, controls, gameData, user, profile, onGameEnd) {
    this.container = container;
    this.controls = controls;
    this.gameData = gameData;
    this.user = user;
    this.profile = profile;
    this.onGameEnd = onGameEnd;

    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 0;
    this.gameActive = false;

    this.init();
  }

  init() {
    this.render();

    this.controls.innerHTML = `
      <button id="start-memory" class="btn-primary btn-large">Start Game</button>
    `;

    document.getElementById('start-memory')?.addEventListener('click', () => {
      this.startGame();
    });
  }

  startGame() {
    const symbols = ['🎮', '🎯', '🎲', '🎨', '🎭', '🎪', '🎸', '🎹'];
    this.cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }));

    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 1000;
    this.gameActive = true;

    this.controls.innerHTML = `
      <button id="end-memory" class="btn-danger">End Game</button>
    `;

    document.getElementById('end-memory')?.addEventListener('click', () => {
      this.endGame();
    });

    this.render();
    this.attachCardListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="memory-game">
        <div class="game-info">
          <p>Moves: <span id="memory-moves">${this.moves}</span></p>
          <p>Score: <span id="memory-score">${this.score}</span></p>
        </div>
        <div class="memory-grid">
          ${this.cards.map(card => `
            <div class="memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" data-id="${card.id}">
              <div class="card-front">?</div>
              <div class="card-back">${card.symbol}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachCardListeners() {
    const cardElements = document.querySelectorAll('.memory-card');
    cardElements.forEach(el => {
      el.addEventListener('click', () => {
        if (!this.gameActive) return;

        const cardId = parseInt(el.dataset.id);
        this.flipCard(cardId);
      });
    });
  }

  flipCard(cardId) {
    const card = this.cards[cardId];

    if (card.flipped || card.matched || this.flippedCards.length >= 2) {
      return;
    }

    card.flipped = true;
    this.flippedCards.push(card);

    this.render();
    this.attachCardListeners();

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.score = Math.max(0, this.score - 10);

      document.getElementById('memory-moves').textContent = this.moves;
      document.getElementById('memory-score').textContent = this.score;

      setTimeout(() => {
        this.checkMatch();
      }, 1000);
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;

    if (card1.symbol === card2.symbol) {
      card1.matched = true;
      card2.matched = true;
      this.matchedPairs++;

      if (this.matchedPairs === 8) {
        this.gameActive = false;
        setTimeout(() => {
          alert('Congratulations! You won!');
          this.endGame();
        }, 500);
      }
    } else {
      card1.flipped = false;
      card2.flipped = false;
    }

    this.flippedCards = [];
    this.render();
    this.attachCardListeners();
  }

  endGame() {
    this.gameActive = false;
    this.onGameEnd(this.gameData, this.user, this.profile, this.score);
  }
}
