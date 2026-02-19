import { getCurrentUser, getUserProfile, getGames, signOut } from '../supabaseClient.js';
import { router } from '../router.js';

let currentUser = null;
let currentProfile = null;

export async function renderHomePage() {
  currentUser = await getCurrentUser();

  if (!currentUser) {
    router.navigate('/');
    return;
  }

  const { data: profile } = await getUserProfile(currentUser.id);

  if (!profile) {
    router.navigate('/setup-profile');
    return;
  }

  currentProfile = profile;

  const { data: games } = await getGames();

  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="app-layout ${profile.theme_preference === 'dark' ? 'dark' : 'light'}">
      <nav class="navbar">
        <div class="nav-left">
          <h1 class="nav-logo">🎮 BU GAMERS</h1>
        </div>
        <div class="nav-center">
          <button class="nav-link active" data-page="games">Games</button>
          <button class="nav-link" data-page="leaderboard">Leaderboard</button>
          <button class="nav-link" data-page="profile">Profile</button>
          ${profile.is_admin ? '<button class="nav-link" data-page="admin">Admin</button>' : ''}
        </div>
        <div class="nav-right">
          <div class="buxp-display">
            <span class="buxp-icon">⭐</span>
            <span class="buxp-amount">${profile.total_buxp} BUXP</span>
          </div>
          <button id="theme-toggle" class="icon-btn" title="Toggle theme">
            ${profile.theme_preference === 'dark' ? '☀️' : '🌙'}
          </button>
          <div class="user-menu">
            <button class="user-avatar" id="user-menu-btn">
              ${renderAvatar(profile.avatar_data)}
            </button>
            <div class="user-dropdown" id="user-dropdown">
              <div class="dropdown-header">
                <strong>${profile.username}</strong>
                <small>${profile.enrollment_number}</small>
              </div>
              <button class="dropdown-item" id="logout-btn">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main class="main-content" id="main-content">
        ${renderGamesGrid(games)}
      </main>
    </div>
  `;

  setupHomeEventListeners();
}

function renderAvatar(avatarData) {
  const colors = {
    tone1: '#FFDFC4',
    tone2: '#F0C8A0',
    tone3: '#D6A784',
    tone4: '#C68B5A',
    tone5: '#8D5524'
  };

  const skinColor = colors[avatarData.skin] || colors.tone2;

  return `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="${skinColor}"/>
      <circle cx="14" cy="16" r="2" fill="#000"/>
      <circle cx="26" cy="16" r="2" fill="#000"/>
      <path d="M 14 24 Q 20 28, 26 24" stroke="#000" stroke-width="2" fill="none"/>
    </svg>
  `;
}

function renderGamesGrid(games) {
  if (!games || games.length === 0) {
    return '<div class="empty-state"><p>No games available</p></div>';
  }

  const gamesByCategory = {
    'Casual': [],
    'Strategy': [],
    'Arcade': [],
    'Competitive': []
  };

  games.forEach(game => {
    if (gamesByCategory[game.category]) {
      gamesByCategory[game.category].push(game);
    }
  });

  let html = '<div class="games-container">';
  html += '<h2 class="page-title">Game Gallery</h2>';

  for (const [category, categoryGames] of Object.entries(gamesByCategory)) {
    if (categoryGames.length > 0) {
      html += `
        <div class="game-category">
          <h3 class="category-title">${category} Games</h3>
          <div class="games-grid">
            ${categoryGames.map(game => renderGameCard(game)).join('')}
          </div>
        </div>
      `;
    }
  }

  html += '</div>';
  return html;
}

function renderGameCard(game) {
  const difficultyColors = {
    'Easy': '#4CAF50',
    'Medium': '#FF9800',
    'Hard': '#F44336'
  };

  return `
    <div class="game-card" data-game-id="${game.id}" data-game-slug="${game.slug}">
      <div class="game-image">
        <div class="game-icon">${getGameIcon(game.slug)}</div>
      </div>
      <div class="game-info">
        <h4 class="game-title">${game.name}</h4>
        <p class="game-description">${game.description}</p>
        <div class="game-meta">
          <span class="game-difficulty" style="color: ${difficultyColors[game.difficulty]}">
            ${game.difficulty}
          </span>
          <span class="game-reward">+${game.buxp_reward} BUXP</span>
        </div>
      </div>
      <button class="game-play-btn" data-slug="${game.slug}">
        PLAY ▶
      </button>
    </div>
  `;
}

function getGameIcon(slug) {
  const icons = {
    'tictactoe': '⭕',
    'snake': '🐍',
    'flappybird': '🐦',
    '2048': '🔢',
    'memory': '🎴',
    'whack': '🔨',
    'brick': '🧱',
    'space': '🚀',
    'fruit': '🍉',
    'platform': '🪜',
    'sudoku': '🔢',
    'chess': '♟️',
    'minesweeper': '💣',
    'connect4': '🔴',
    'tower': '🗼',
    'quiz': '❓',
    'coding': '💻',
    'word': '📝',
    'reaction': '⚡',
    'typing': '⌨️',
    'rps': '✊',
    'arena': '⚔️'
  };

  return icons[slug] || '🎮';
}

function setupHomeEventListeners() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');

      const page = e.target.dataset.page;
      loadPage(page);
    });
  });

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  document.getElementById('user-menu-btn')?.addEventListener('click', () => {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('show');
  });

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await signOut();
    router.navigate('/');
  });

  const playButtons = document.querySelectorAll('.game-play-btn');
  playButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slug = e.target.dataset.slug;
      router.navigate(`/game/${slug}`);
    });
  });

  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-dropdown');
    const menuBtn = document.getElementById('user-menu-btn');

    if (dropdown && !dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

async function toggleTheme() {
  const newTheme = currentProfile.theme_preference === 'dark' ? 'light' : 'dark';
  currentProfile.theme_preference = newTheme;

  const { updateUserProfile } = await import('../supabaseClient.js');
  await updateUserProfile(currentUser.id, { theme_preference: newTheme });

  document.querySelector('.app-layout').className = `app-layout ${newTheme}`;
  document.getElementById('theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

async function loadPage(page) {
  const mainContent = document.getElementById('main-content');

  switch (page) {
    case 'games':
      const { data: games } = await getGames();
      mainContent.innerHTML = renderGamesGrid(games);
      setupGameCardListeners();
      break;

    case 'leaderboard':
      const { renderLeaderboardPage } = await import('./leaderboard.js');
      await renderLeaderboardPage(mainContent);
      break;

    case 'profile':
      const { renderProfilePage } = await import('./profile.js');
      await renderProfilePage(mainContent, currentUser, currentProfile);
      break;

    case 'admin':
      if (currentProfile.is_admin) {
        const { renderAdminPage } = await import('./admin.js');
        await renderAdminPage(mainContent);
      }
      break;
  }
}

function setupGameCardListeners() {
  const playButtons = document.querySelectorAll('.game-play-btn');
  playButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slug = e.target.dataset.slug;
      router.navigate(`/game/${slug}`);
    });
  });
}
