import { updateUserProfile, supabase } from '../supabaseClient.js';

export async function renderProfilePage(container, user, profile) {
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievements (name, description, badge_icon, buxp_reward)
    `)
    .eq('user_id', user.id);

  const { data: stats } = await supabase
    .from('game_scores')
    .select('score')
    .eq('user_id', user.id);

  const totalGames = stats?.length || 0;
  const totalScore = stats?.reduce((sum, s) => sum + s.score, 0) || 0;
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;

  container.innerHTML = `
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-avatar-large">
          ${renderLargeAvatar(profile.avatar_data)}
        </div>
        <div class="profile-info">
          <h2>${profile.username}</h2>
          <p>${profile.enrollment_number}</p>
          <p>${profile.batch} - ${profile.course}</p>
          <div class="profile-buxp">
            <span class="buxp-large">⭐ ${profile.total_buxp} BUXP</span>
          </div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <div class="stat-value">${totalGames}</div>
          <div class="stat-label">Games Played</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalScore}</div>
          <div class="stat-label">Total Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${avgScore}</div>
          <div class="stat-label">Avg Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${achievements?.length || 0}</div>
          <div class="stat-label">Achievements</div>
        </div>
      </div>

      <div class="profile-section">
        <h3>Achievements</h3>
        <div class="achievements-grid">
          ${achievements && achievements.length > 0
            ? achievements.map(a => `
                <div class="achievement-badge">
                  <div class="badge-icon">${a.achievements.badge_icon}</div>
                  <div class="badge-name">${a.achievements.name}</div>
                  <div class="badge-reward">+${a.achievements.buxp_reward} BUXP</div>
                </div>
              `).join('')
            : '<p class="empty-state">No achievements yet. Keep playing!</p>'
          }
        </div>
      </div>

      <div class="profile-section">
        <h3>Customize Avatar</h3>
        <div class="avatar-customizer">
          <div class="avatar-preview">
            ${renderLargeAvatar(profile.avatar_data)}
          </div>
          <div class="avatar-options">
            <div class="option-group">
              <label>Skin Tone</label>
              <div class="color-options">
                <button class="color-btn ${profile.avatar_data.skin === 'tone1' ? 'active' : ''}" data-skin="tone1" style="background: #FFDFC4"></button>
                <button class="color-btn ${profile.avatar_data.skin === 'tone2' ? 'active' : ''}" data-skin="tone2" style="background: #F0C8A0"></button>
                <button class="color-btn ${profile.avatar_data.skin === 'tone3' ? 'active' : ''}" data-skin="tone3" style="background: #D6A784"></button>
                <button class="color-btn ${profile.avatar_data.skin === 'tone4' ? 'active' : ''}" data-skin="tone4" style="background: #C68B5A"></button>
                <button class="color-btn ${profile.avatar_data.skin === 'tone5' ? 'active' : ''}" data-skin="tone5" style="background: #8D5524"></button>
              </div>
            </div>
            <button id="save-avatar-btn" class="btn-primary">Save Avatar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  setupProfileEventListeners(user, profile);
}

function renderLargeAvatar(avatarData) {
  const colors = {
    tone1: '#FFDFC4',
    tone2: '#F0C8A0',
    tone3: '#D6A784',
    tone4: '#C68B5A',
    tone5: '#8D5524'
  };

  const skinColor = colors[avatarData.skin] || colors.tone2;

  return `
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="50" fill="${skinColor}"/>
      <circle cx="45" cy="50" r="6" fill="#000"/>
      <circle cx="75" cy="50" r="6" fill="#000"/>
      <path d="M 45 70 Q 60 80, 75 70" stroke="#000" stroke-width="3" fill="none"/>
    </svg>
  `;
}

function setupProfileEventListeners(user, profile) {
  const colorButtons = document.querySelectorAll('.color-btn');
  let selectedSkin = profile.avatar_data.skin;

  colorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      colorButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      selectedSkin = e.target.dataset.skin;

      const newAvatarData = { ...profile.avatar_data, skin: selectedSkin };
      document.querySelector('.avatar-preview').innerHTML = renderLargeAvatar(newAvatarData);
    });
  });

  document.getElementById('save-avatar-btn')?.addEventListener('click', async () => {
    const newAvatarData = { ...profile.avatar_data, skin: selectedSkin };

    const { error } = await updateUserProfile(user.id, { avatar_data: newAvatarData });

    if (error) {
      alert('Error saving avatar: ' + error.message);
    } else {
      alert('Avatar saved successfully!');
      profile.avatar_data = newAvatarData;
    }
  });
}
