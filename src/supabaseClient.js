import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/setup-profile'
    }
  });
  return { data, error };
}

export async function signInWithMicrosoft() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: window.location.origin + '/setup-profile'
    }
  });
  return { data, error };
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + '/setup-profile'
    }
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return { data, error };
}

export async function createUserProfile(profileData) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profileData])
    .select()
    .single();
  return { data, error };
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

export async function getGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return { data, error };
}

export async function submitScore(userId, gameId, score, buxpEarned) {
  const { data, error } = await supabase
    .from('game_scores')
    .insert([{ user_id: userId, game_id: gameId, score, buxp_earned: buxpEarned }])
    .select()
    .single();
  return { data, error };
}

export async function updateLeaderboard(userId, gameId, score) {
  const { data: existing } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .maybeSingle();

  if (existing) {
    const updates = {
      total_plays: existing.total_plays + 1,
      best_score: Math.max(existing.best_score, score),
      updated_at: new Date().toISOString()
    };

    if (score > existing.best_score) {
      updates.total_wins = existing.total_wins + 1;
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();
    return { data, error };
  } else {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([{
        user_id: userId,
        game_id: gameId,
        best_score: score,
        total_plays: 1,
        total_wins: 1
      }])
      .select()
      .single();
    return { data, error };
  }
}

export async function getLeaderboard(gameId, limit = 100) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select(`
      *,
      user_profiles (username, enrollment_number, avatar_data, batch, course)
    `)
    .eq('game_id', gameId)
    .order('best_score', { ascending: false })
    .limit(limit);
  return { data, error };
}

export async function addBUXP(userId, amount, source) {
  const { data: profile } = await getUserProfile(userId);
  const newTotal = (profile?.total_buxp || 0) + amount;

  await supabase
    .from('user_profiles')
    .update({ total_buxp: newTotal })
    .eq('id', userId);

  await supabase
    .from('currency_transactions')
    .insert([{
      user_id: userId,
      amount,
      transaction_type: 'earn',
      source
    }]);

  return newTotal;
}

export async function checkAndAwardAchievements(userId) {
  const { data: profile } = await getUserProfile(userId);
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const earnedIds = userAchievements.map(ua => ua.achievement_id);

  const { data: scores } = await supabase
    .from('game_scores')
    .select('score')
    .eq('user_id', userId);

  const totalWins = scores?.length || 0;
  const maxScore = Math.max(...(scores?.map(s => s.score) || [0]));

  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*');

  const newAchievements = [];

  for (const achievement of allAchievements || []) {
    if (earnedIds.includes(achievement.id)) continue;

    let earned = false;
    if (achievement.requirement_type === 'wins' && totalWins >= achievement.requirement_value) {
      earned = true;
    } else if (achievement.requirement_type === 'score' && maxScore >= achievement.requirement_value) {
      earned = true;
    } else if (achievement.requirement_type === 'currency' && profile.total_buxp >= achievement.requirement_value) {
      earned = true;
    }

    if (earned) {
      await supabase
        .from('user_achievements')
        .insert([{ user_id: userId, achievement_id: achievement.id }]);

      await addBUXP(userId, achievement.buxp_reward, 'achievement');
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}
