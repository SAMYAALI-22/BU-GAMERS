import './style.css';
import { router } from './src/router.js';
import { supabase, getCurrentUser, getUserProfile } from './src/supabaseClient.js';
import { renderAuthPage } from './src/pages/auth.js';
import { renderSetupProfile } from './src/pages/setupProfile.js';
import { renderHomePage } from './src/pages/home.js';
import { renderGameLauncher } from './src/pages/gameLauncher.js';

async function init() {
  router.register('/', renderAuthPage);
  router.register('/auth', renderAuthPage);
  router.register('/setup-profile', renderSetupProfile);
  router.register('/home', renderHomePage);

  router.register('/game/:slug', async () => {
    const path = window.location.pathname;
    const slug = path.split('/game/')[1];
    if (slug) {
      await renderGameLauncher(slug);
    }
  });

  router.register('/404', () => {
    document.querySelector('#app').innerHTML = `
      <div class="error-page">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <button onclick="window.location.href='/home'" class="btn-primary">Go Home</button>
      </div>
    `;
  });

  supabase.auth.onAuthStateChange((event, session) => {
    (async () => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
        const { data: profile } = await getUserProfile(user.id);

        if (!profile) {
          router.navigate('/setup-profile');
        } else if (window.location.pathname === '/' || window.location.pathname === '/auth') {
          router.navigate('/home');
        }
      } else if (event === 'SIGNED_OUT') {
        router.navigate('/');
      }
    })();
  });

  const currentPath = window.location.pathname;

  if (currentPath.startsWith('/game/')) {
    const slug = currentPath.split('/game/')[1];
    await renderGameLauncher(slug);
  } else {
    const user = await getCurrentUser();

    if (user) {
      const { data: profile } = await getUserProfile(user.id);

      if (!profile) {
        router.navigate('/setup-profile');
      } else if (currentPath === '/' || currentPath === '/auth') {
        router.navigate('/home');
      } else if (currentPath === '/home') {
        renderHomePage();
      } else if (currentPath === '/setup-profile') {
        renderSetupProfile();
      } else {
        router.navigate('/home');
      }
    } else {
      if (currentPath === '/setup-profile' || currentPath === '/home' || currentPath.startsWith('/game/')) {
        router.navigate('/');
      } else {
        renderAuthPage();
      }
    }
  }
}

init();
