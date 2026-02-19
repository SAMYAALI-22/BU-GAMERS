import { signInWithGoogle, signInWithMicrosoft, signInWithEmail, signUpWithEmail } from '../supabaseClient.js';

export function renderAuthPage() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-box">
        <div class="auth-header">
          <h1>🎮 BU GAMERS</h1>
          <p>Bennett University Gaming Platform</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="signin">Sign In</button>
          <button class="auth-tab" data-tab="signup">Sign Up</button>
        </div>

        <div class="auth-content">
          <div id="signin-form" class="auth-form active">
            <h2>Welcome Back!</h2>

            <div class="oauth-buttons">
              <button id="google-signin" class="oauth-btn google">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>

              <button id="microsoft-signin" class="oauth-btn microsoft">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#f25022" d="M0 0h8.5v8.5H0z"/>
                  <path fill="#00a4ef" d="M9.5 0H18v8.5H9.5z"/>
                  <path fill="#7fba00" d="M0 9.5h8.5V18H0z"/>
                  <path fill="#ffb900" d="M9.5 9.5H18V18H9.5z"/>
                </svg>
                Continue with Microsoft
              </button>
            </div>

            <div class="divider">
              <span>or</span>
            </div>

            <form id="email-signin-form">
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="signin-email" placeholder="your.email@bennett.edu.in" required>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="signin-password" placeholder="Enter your password" required>
              </div>
              <button type="submit" class="btn-primary">Sign In</button>
            </form>
          </div>

          <div id="signup-form" class="auth-form">
            <h2>Create Account</h2>

            <div class="oauth-buttons">
              <button id="google-signup" class="oauth-btn google">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Sign up with Google
              </button>

              <button id="microsoft-signup" class="oauth-btn microsoft">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#f25022" d="M0 0h8.5v8.5H0z"/>
                  <path fill="#00a4ef" d="M9.5 0H18v8.5H9.5z"/>
                  <path fill="#7fba00" d="M0 9.5h8.5V18H0z"/>
                  <path fill="#ffb900" d="M9.5 9.5H18V18H9.5z"/>
                </svg>
                Sign up with Microsoft
              </button>
            </div>

            <div class="divider">
              <span>or</span>
            </div>

            <form id="email-signup-form">
              <div class="form-group">
                <label>Bennett Email</label>
                <input type="email" id="signup-email" placeholder="your.email@bennett.edu.in" required>
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" id="signup-password" placeholder="Create a strong password" required>
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" id="signup-password-confirm" placeholder="Re-enter password" required>
              </div>
              <button type="submit" class="btn-primary">Create Account</button>
            </form>
          </div>
        </div>

        <div id="auth-message" class="auth-message"></div>
      </div>
    </div>
  `;

  setupAuthEventListeners();
}

function setupAuthEventListeners() {
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
      });

      const tabName = tab.dataset.tab;
      document.getElementById(`${tabName}-form`).classList.add('active');
    });
  });

  document.getElementById('google-signin')?.addEventListener('click', async () => {
    const { error } = await signInWithGoogle();
    if (error) showMessage('Error signing in with Google: ' + error.message, 'error');
  });

  document.getElementById('microsoft-signin')?.addEventListener('click', async () => {
    const { error } = await signInWithMicrosoft();
    if (error) showMessage('Error signing in with Microsoft: ' + error.message, 'error');
  });

  document.getElementById('google-signup')?.addEventListener('click', async () => {
    const { error } = await signInWithGoogle();
    if (error) showMessage('Error signing up with Google: ' + error.message, 'error');
  });

  document.getElementById('microsoft-signup')?.addEventListener('click', async () => {
    const { error } = await signInWithMicrosoft();
    if (error) showMessage('Error signing up with Microsoft: ' + error.message, 'error');
  });

  document.getElementById('email-signin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    const { data, error } = await signInWithEmail(email, password);
    if (error) {
      showMessage('Error signing in: ' + error.message, 'error');
    } else {
      showMessage('Sign in successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    }
  });

  document.getElementById('email-signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;

    if (!email.endsWith('@bennett.edu.in')) {
      showMessage('Please use your Bennett University email', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    const { data, error } = await signUpWithEmail(email, password);
    if (error) {
      showMessage('Error signing up: ' + error.message, 'error');
    } else {
      showMessage('Account created! Redirecting to setup profile...', 'success');
      setTimeout(() => {
        window.location.href = '/setup-profile';
      }, 1000);
    }
  });
}

function showMessage(message, type) {
  const messageEl = document.getElementById('auth-message');
  messageEl.textContent = message;
  messageEl.className = `auth-message ${type}`;
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}
