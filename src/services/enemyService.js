const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const createEnemy = async (userId, enemyData) => {
  const { data: enemy, error } = await supabaseAdmin
    .from("enemies")
    .insert([{ ...enemyData, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return enemy;
};

const triggerEnemy = async (enemyId, userId) => {
  // Fetch enemy details
  const { data: enemy, error: fetchError } = await supabaseAdmin
    .from("enemies")
    .select("*")
    .eq("id", enemyId)
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    throw new AppError(fetchError.message, 400);
  }

  // Calculate HP reduction
  const hpReduction = enemy.hp_reduction || 10;

  // Update enemy trigger
  const { error: updateError } = await supabaseAdmin
    .from("enemy_triggers")
    .insert([
      {
        enemy_id: enemyId,
        user_id: userId,
        triggered_date: new Date().toISOString(),
        hp_lost: hpReduction,
      },
    ]);

  if (updateError) {
    throw new AppError(updateError.message, 400);
  }

  // Update user HP
  const { error: userError } = await supabaseAdmin.rpc("decrement_user_hp", {
    user_id: userId,
    hp_amount: hpReduction,
  });

  if (userError) {
    throw new AppError(userError.message, 400);
  }

  return { success: true };
};

const updateEnemyStreak = async (enemyId, isTriggered) => {
  const { data: enemy, error } = await supabaseAdmin
    .from("enemies")
    .select("current_streak, best_streak")
    .eq("id", enemyId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  let currentStreak = enemy.current_streak;
  let bestStreak = enemy.best_streak;

  if (!isTriggered) {
    currentStreak += 1;
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  } else {
    currentStreak = 0;
  }

  const { error: updateError } = await supabaseAdmin
    .from("enemies")
    .update({ current_streak: currentStreak, best_streak: bestStreak })
    .eq("id", enemyId);

  if (updateError) {
    throw new AppError(updateError.message, 400);
  }

  return { currentStreak, bestStreak };
};

const calculateHPLoss = (enemy) => {
  return enemy.hp_reduction || 10;
};

module.exports = {
  createEnemy,
  triggerEnemy,
  updateEnemyStreak,
  calculateHPLoss,
};
