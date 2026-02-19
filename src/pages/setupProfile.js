import { getCurrentUser, getUserProfile, createUserProfile } from '../supabaseClient.js';
import { router } from '../router.js';

export async function renderSetupProfile() {
  const user = await getCurrentUser();

  if (!user) {
    router.navigate('/');
    return;
  }

  const { data: existingProfile } = await getUserProfile(user.id);

  if (existingProfile) {
    router.navigate('/home');
    return;
  }

  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="setup-container">
      <div class="setup-box">
        <h1>🎮 Complete Your Profile</h1>
        <p>Just a few more details to get you gaming!</p>

        <form id="profile-setup-form">
          <div class="form-group">
            <label>Username *</label>
            <input type="text" id="username" placeholder="Choose a unique username" required>
            <small>This will be visible on leaderboards</small>
          </div>

          <div class="form-group">
            <label>Enrollment Number *</label>
            <input type="text" id="enrollment" placeholder="E.g., E22CSEU1234" required pattern="[A-Z][0-9]{2}[A-Z]{3,4}[0-9]{4}">
            <small>Your Bennett University enrollment number</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Batch *</label>
              <select id="batch" required>
                <option value="">Select Batch</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            <div class="form-group">
              <label>Course *</label>
              <select id="course" required>
                <option value="">Select Course</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="BBA">Bachelor of Business Administration</option>
                <option value="BCA">Bachelor of Computer Applications</option>
                <option value="BTECH">B.Tech (Other)</option>
                <option value="MBA">Master of Business Administration</option>
                <option value="MTECH">M.Tech</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn-primary">Complete Setup</button>
        </form>

        <div id="setup-message" class="setup-message"></div>
      </div>
    </div>
  `;

  setupProfileEventListeners(user);
}

function setupProfileEventListeners(user) {
  const form = document.getElementById('profile-setup-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const enrollment = document.getElementById('enrollment').value.trim().toUpperCase();
    const batch = document.getElementById('batch').value;
    const course = document.getElementById('course').value;

    if (!username || !enrollment || !batch || !course) {
      showSetupMessage('Please fill in all required fields', 'error');
      return;
    }

    const profileData = {
      id: user.id,
      username,
      enrollment_number: enrollment,
      email: user.email,
      batch,
      course,
      total_buxp: 100,
      avatar_data: {
        hair: 'style1',
        skin: 'tone2',
        clothes: 'outfit1'
      },
      theme_preference: 'dark',
      is_admin: false
    };

    const { data, error } = await createUserProfile(profileData);

    if (error) {
      if (error.code === '23505') {
        showSetupMessage('Username or enrollment number already exists', 'error');
      } else {
        showSetupMessage('Error creating profile: ' + error.message, 'error');
      }
    } else {
      showSetupMessage('Profile created successfully! Welcome to BU GAMERS! 🎮', 'success');
      setTimeout(() => {
        router.navigate('/home');
      }, 1500);
    }
  });
}

function showSetupMessage(message, type) {
  const messageEl = document.getElementById('setup-message');
  messageEl.textContent = message;
  messageEl.className = `setup-message ${type}`;
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}
