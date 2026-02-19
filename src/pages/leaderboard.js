import { getGames, getLeaderboard } from '../supabaseClient.js';

export async function renderLeaderboardPage(container) {
  container.innerHTML = `
    <div class="leaderboard-container">
      <h2 class="page-title">Global Leaderboard</h2>

      <div class="leaderboard-filters">
        <select id="game-filter" class="filter-select">
          <option value="">Loading games...</option>
        </select>
      </div>

      <div id="leaderboard-content">
        <p class="loading">Select a game to view leaderboard...</p>
      </div>
    </div>
  `;

  const filterSelect = document.getElementById('game-filter');
  const content = document.getElementById('leaderboard-content');

  try {
    const { data: games, error } = await getGames();

    if (error || !games || games.length === 0) {
      filterSelect.innerHTML = `<option value="">No games available</option>`;
      return;
    }

    filterSelect.innerHTML = `
      <option value="">All Games</option>
      ${games.map(game => 
        `<option value="${game.id}">${game.name}</option>`
      ).join('')}
    `;
  } catch (err) {
    console.error('Error loading games:', err);
    filterSelect.innerHTML = `<option value="">Error loading games</option>`;
    return;
  }

  filterSelect.addEventListener('change', async (e) => {
    const gameId = e.target.value;

    if (!gameId) {
      content.innerHTML = '<p class="loading">Select a game to view leaderboard...</p>';
      return;
    }

    content.innerHTML = '<p class="loading">Loading leaderboard...</p>';

    try {
      const { data: leaderboardData, error } = await getLeaderboard(gameId);

      if (error) {
        console.error(error);
        content.innerHTML = '<p class="empty-state">Error loading leaderboard.</p>';
        return;
      }

      renderLeaderboardTable(leaderboardData || []);
    } catch (err) {
      console.error('Leaderboard fetch failed:', err);
      content.innerHTML = '<p class="empty-state">Failed to load leaderboard.</p>';
    }
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
    const medal =
      rank === 1 ? '🥇' :
      rank === 2 ? '🥈' :
      rank === 3 ? '🥉' :
      rank;

    const profile = entry.user_profiles || {};

    html += `
      <tr class="leaderboard-row ${rank <= 3 ? 'top-rank' : ''}">
        <td class="rank">${medal}</td>
        <td class="player">
          <strong>${profile.username || 'Unknown'}</strong>
          <small>${profile.enrollment_number ? profile.enrollment_number.slice(0, 6) + '***' : ''}</small>
        </td>
        <td>${profile.batch || '-'}</td>
        <td>${profile.course || '-'}</td>
        <td class="score"><strong>${entry.best_score || 0}</strong></td>
        <td>${entry.total_wins || 0}</td>
        <td>${entry.total_plays || 0}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  content.innerHTML = html;
}
