const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const { calculateLevel } = require("../utils/gameCalculations");

const getUserById = async (userId) => {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return user;
};

const updateUser = async (userId, updates) => {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return user;
};

const getUserStats = async (userId) => {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select(
      "total_xp, overall_level, current_hp, max_hp, in_app_currency, gems"
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  const { data: tasks } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  const { data: skills } = await supabaseAdmin
    .from("skills")
    .select("*")
    .eq("user_id", userId);

  const { data: achievements } = await supabaseAdmin
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("is_completed", true);

  return {
    totalXP: user.total_xp,
    level: user.overall_level,
    currentHP: user.current_hp,
    maxHP: user.max_hp,
    currency: user.in_app_currency,
    gems: user.gems,
    tasksCompleted: tasks.length,
    skillsMastered: skills.length,
    achievementsUnlocked: achievements.length,
  };
};

const updateUserXP = async (userId, xpAmount) => {
  const { data: user, error } = await supabaseAdmin.rpc("increment_user_xp", {
    user_id: userId,
    xp_amount: xpAmount,
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  // Check if the user has leveled up
  const newLevel = calculateLevel(user.total_xp);
  if (newLevel > user.overall_level) {
    await supabaseAdmin
      .from("users")
      .update({ overall_level: newLevel })
      .eq("id", userId);
  }

  return user;
};

const updateUserHP = async (userId, hpChange) => {
  const { data: user, error } = await supabaseAdmin.rpc("increment_user_hp", {
    user_id: userId,
    hp_amount: hpChange,
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  return user;
};

const checkLevelUp = async (userId) => {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("total_xp, overall_level")
    .eq("id", userId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  const newLevel = calculateLevel(user.total_xp);
  if (newLevel > user.overall_level) {
    await supabaseAdmin
      .from("users")
      .update({ overall_level: newLevel })
      .eq("id", userId);
    return true;
  }

  return false;
};

module.exports = {
  getUserById,
  updateUser,
  getUserStats,
  updateUserXP,
  updateUserHP,
  checkLevelUp,
};
