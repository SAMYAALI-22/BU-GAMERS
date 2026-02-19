import { getCurrentUser, getUserProfile, supabase, submitScore, updateLeaderboard, addBUXP, checkAndAwardAchievements } from '../supabaseClient.js';
import { router } from '../router.js';

export async function renderGameLauncher(gameSlug) {
  const user = await getCurrentUser();

  if (!user) {
    router.navigate('/');
    return;
  }

  const { data: profile } = await getUserProfile(user.id);
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', gameSlug)
    .maybeSingle();

  if (!game) {
    document.querySelector('#app').innerHTML = '<div class="error-page"><h1>Game Not Found</h1></div>';
    return;
  }

  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="game-launcher ${profile.theme_preference === 'dark' ? 'dark' : 'light'}">
      <div class="game-header">
        <button id="back-btn" class="back-btn">← Back to Games</button>
        <h2>${game.name}</h2>
        <div class="game-buxp">+${game.buxp_reward} BUXP per win</div>
      </div>
      <div class="game-canvas-container" id="game-container">
        <!-- Game will be rendered here -->
      </div>
      <div class="game-controls" id="game-controls">
        <button id="start-game-btn" class="btn-primary btn-large">Start Game</button>
      </div>
      <div id="game-result" class="game-result hidden"></div>
    </div>
  `;

  document.getElementById('back-btn')?.addEventListener('click', () => {
    router.navigate('/home');
  });

  loadGame(gameSlug, game, user, profile);
}

async function loadGame(gameSlug, gameData, user, profile) {
  const gameContainer = document.getElementById('game-container');
  const controls = document.getElementById('game-controls');

  switch (gameSlug) {
    case 'tictactoe':
      const { TicTacToe } = await import('../games/tictactoe.js');
      new TicTacToe(gameContainer, controls, gameData, user, profile, handleGameEnd);
      break;

    case 'snake':
      const { Snake } = await import('../games/snake.js');
      new Snake(gameContainer, controls, gameData, user, profile, handleGameEnd);
      break;

    case '2048':
      const { Game2048 } = await import('../games/2048.js');
      new Game2048(gameContainer, controls, gameData, user, profile, handleGameEnd);
      break;

    case 'memory':
      const { MemoryMatch } = await import('../games/memory.js');
      new MemoryMatch(gameContainer, controls, gameData, user, profile, handleGameEnd);
      break;

    case 'reaction':
      const { ReactionTime } = await import('../games/reaction.js');
      new ReactionTime(gameContainer, controls, gameData, user, profile, handleGameEnd);
      break;

    default:
      gameContainer.innerHTML = '<div class="empty-state"><p>This game is coming soon!</p></div>';
      break;
  }
}

async function handleGameEnd(gameData, user, profile, score) {
  await submitScore(user.id, gameData.id, score, gameData.buxp_reward);

  await updateLeaderboard(user.id, gameData.id, score);

  const newBUXP = await addBUXP(user.id, gameData.buxp_reward, 'game_win');

  const newAchievements = await checkAndAwardAchievements(user.id);

  const resultEl = document.getElementById('game-result');
  resultEl.className = 'game-result show';

  let achievementHTML = '';
  if (newAchievements.length > 0) {
    achievementHTML = `
      <div class="achievements-earned">
        <h4>🎉 New Achievements!</h4>
        ${newAchievements.map(a => `
          <div class="achievement-popup">
            ${a.badge_icon} ${a.name} (+${a.buxp_reward} BUXP)
          </div>
        `).join('')}
      </div>
    `;
  }

  resultEl.innerHTML = `
    <div class="result-content">
      <h3>🎮 Game Over!</h3>
      <div class="result-score">Score: ${score}</div>
      <div class="result-buxp">+${gameData.buxp_reward} BUXP earned!</div>
      <div class="result-total">Total BUXP: ${newBUXP}</div>
      ${achievementHTML}
      <div class="result-actions">
        <button id="play-again-btn" class="btn-primary">Play Again</button>
        <button id="home-btn" class="btn-secondary">Back to Home</button>
      </div>
    </div>
  `;

  document.getElementById('play-again-btn')?.addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('home-btn')?.addEventListener('click', () => {
    router.navigate('/home');
  });
}
