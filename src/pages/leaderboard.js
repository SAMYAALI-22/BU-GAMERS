import { getGames, getLeaderboard } from '../supabaseClient.js';

export async function renderLeaderboardPage(container) {
  const { data: games } = await getGames();

  container.innerHTML = `
    <div class="leaderboard-container">
      <h2 class="page-title">Global Leaderboard</h2>

      <div class="leaderboard-filters">
        <select id="game-filter" class="filter-select">
          <option value="">All Games</option>
          ${games.map(game => `<option value="${game.id}">${game.name}</option>`).join('')}
        </select>
      </div>

      <div id="leaderboard-content">
        <p class="loading">Select a game to view leaderboard...</p>
      </div>
    </div>
  `;

  document.getElementById('game-filter')?.addEventListener('change', async (e) => {
    const gameId = e.target.value;

    if (!gameId) {
      document.getElementById('leaderboard-content').innerHTML = '<p class="loading">Select a game to view leaderboard...</p>';
      return;
    }

    const { data: leaderboardData } = await getLeaderboard(gameId);

    renderLeaderboardTable(leaderboardData);
  });
}

function renderLeaderboardTable(data) {
  const content = document.getElementById('leaderboard-content');

  if (!data || data.length === 0) {
    content.innerHTML = '<p class="empty-state">No scores yet. Be the first to play!</p>';
    return;
  }

  let html = `
    <table class="leaderboard-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Batch</th>
          <th>Course</th>
          <th>Score</th>
          <th>Wins</th>
          <th>Plays</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((entry, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;

    html += `
      <tr class="leaderboard-row ${rank <= 3 ? 'top-rank' : ''}">
        <td class="rank">${medal}</td>
        <td class="player">
          <strong>${entry.user_profiles.username}</strong>
          <small>${entry.user_profiles.enrollment_number.slice(0, 6)}***</small>
        </td>
        <td>${entry.user_profiles.batch}</td>
        <td>${entry.user_profiles.course}</td>
        <td class="score"><strong>${entry.best_score}</strong></td>
        <td>${entry.total_wins}</td>
        <td>${entry.total_plays}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  content.innerHTML = html;
}
