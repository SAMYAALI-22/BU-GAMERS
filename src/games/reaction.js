export class ReactionTime {
  constructor(container, controls, gameData, user, profile, onGameEnd) {
    this.container = container;
    this.controls = controls;
    this.gameData = gameData;
    this.user = user;
    this.profile = profile;
    this.onGameEnd = onGameEnd;

    this.startTime = 0;
    this.times = [];
    this.round = 0;
    this.totalRounds = 5;
    this.waiting = false;
    this.gameActive = false;

    this.init();
  }

  init() {
    this.render();

    this.controls.innerHTML = `
      <button id="start-reaction" class="btn-primary btn-large">Start Test</button>
    `;

    document.getElementById('start-reaction')?.addEventListener('click', () => {
      this.startGame();
    });
  }

  startGame() {
    this.times = [];
    this.round = 0;
    this.gameActive = true;

    this.controls.innerHTML = `
      <button id="end-reaction" class="btn-danger">End Test</button>
    `;

    document.getElementById('end-reaction')?.addEventListener('click', () => {
      this.endGame();
    });

    this.nextRound();
  }

  nextRound() {
    if (this.round >= this.totalRounds) {
      this.showResults();
      return;
    }

    this.round++;
    this.waiting = true;

    this.container.innerHTML = `
      <div class="reaction-game">
        <div class="reaction-info">
          <p>Round ${this.round} of ${this.totalRounds}</p>
          <p>Wait for GREEN, then click!</p>
        </div>
        <div class="reaction-box waiting" id="reaction-box">
          Wait...
        </div>
      </div>
    `;

    const delay = Math.random() * 3000 + 2000;

    setTimeout(() => {
      if (!this.gameActive) return;

      this.waiting = false;
      this.startTime = Date.now();

      const box = document.getElementById('reaction-box');
      box.className = 'reaction-box ready';
      box.textContent = 'CLICK NOW!';

      box.addEventListener('click', () => {
        if (this.waiting) {
          alert('Too early! Wait for GREEN.');
          this.nextRound();
        } else {
          const reactionTime = Date.now() - this.startTime;
          this.times.push(reactionTime);
          this.nextRound();
        }
      }, { once: true });
    }, delay);
  }

  showResults() {
    const avgTime = this.times.reduce((a, b) => a + b, 0) / this.times.length;
    const bestTime = Math.min(...this.times);

    const score = Math.max(0, 1000 - Math.round(avgTime));

    this.container.innerHTML = `
      <div class="reaction-game">
        <div class="reaction-results">
          <h3>Results</h3>
          <p>Average Time: <strong>${avgTime.toFixed(0)}ms</strong></p>
          <p>Best Time: <strong>${bestTime}ms</strong></p>
          <p>Score: <strong>${score}</strong></p>
          <div class="times-list">
            <h4>All Times:</h4>
            ${this.times.map((time, i) => `
              <div>Round ${i + 1}: ${time}ms</div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.endGame(score);
    }, 3000);
  }

  render() {
    this.container.innerHTML = `
      <div class="reaction-game">
        <div class="reaction-info">
          <h3>Reaction Time Test</h3>
          <p>Test your reflexes!</p>
          <p>Click the box as soon as it turns GREEN</p>
          <p>5 rounds total</p>
        </div>
      </div>
    `;
  }

  endGame(score = 0) {
    this.gameActive = false;

    if (this.times.length > 0) {
      const avgTime = this.times.reduce((a, b) => a + b, 0) / this.times.length;
      score = Math.max(0, 1000 - Math.round(avgTime));
    }

    this.onGameEnd(this.gameData, this.user, this.profile, score);
  }
}
