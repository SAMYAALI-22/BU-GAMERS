import { supabase } from '../supabaseClient.js';

export async function renderAdminPage(container) {
  const { data: users } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('name');

  container.innerHTML = `
    <div class="admin-container">
      <h2 class="page-title">Admin Dashboard</h2>

      <div class="admin-stats">
        <div class="stat-card">
          <div class="stat-value">${users?.length || 0}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${games?.length || 0}</div>
          <div class="stat-label">Total Games</div>
        </div>
      </div>

      <div class="admin-section">
        <h3>All Users</h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Enrollment</th>
              <th>Batch</th>
              <th>Course</th>
              <th>BUXP</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            ${users?.map(user => `
              <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.enrollment_number}</td>
                <td>${user.batch}</td>
                <td>${user.course}</td>
                <td>${user.total_buxp}</td>
                <td>${user.is_admin ? '✅' : '❌'}</td>
              </tr>
            `).join('') || '<tr><td colspan="7">No users found</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="admin-section">
        <h3>All Games</h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>BUXP Reward</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            ${games?.map(game => `
              <tr>
                <td>${game.name}</td>
                <td>${game.slug}</td>
                <td>${game.category}</td>
                <td>${game.difficulty}</td>
                <td>${game.buxp_reward}</td>
                <td>${game.is_active ? '✅' : '❌'}</td>
              </tr>
            `).join('') || '<tr><td colspan="6">No games found</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
