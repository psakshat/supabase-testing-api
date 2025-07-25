const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const checkAchievements = async (userId, actionType, data) => {
  const { data: achievements, error } = await supabaseAdmin
    .from("achievements")
    .select("*")
    .eq("is_active", true);

  if (error) {
    throw new AppError(error.message, 400);
  }

  const achievementsUnlocked = [];

  for (const achievement of achievements) {
    let isUnlocked = false;

    switch (achievement.condition_config.type) {
      case "task_completion":
        if (actionType === "task_completion" && data.taskId) {
          const { data: completions } = await supabaseAdmin
            .from("task_completions")
            .select("*")
            .eq("user_id", userId)
            .eq("task_id", data.taskId);

          isUnlocked = completions.length >= achievement.condition_config.value;
        }
        break;
      case "streak":
        if (actionType === "streak" && data.streak) {
          isUnlocked = data.streak >= achievement.condition_config.value;
        }
        break;
      case "user_level":
        if (actionType === "user_level" && data.level) {
          const { data: user } = await supabaseAdmin
            .from("users")
            .select("overall_level")
            .eq("id", userId)
            .single();

          isUnlocked = user.overall_level >= achievement.condition_config.value;
        }
        break;
      case "skill_level":
        if (actionType === "skill_level" && data.skillId) {
          const { data: skill } = await supabaseAdmin
            .from("skills")
            .select("level")
            .eq("id", data.skillId)
            .single();

          isUnlocked = skill.level >= achievement.condition_config.value;
        }
        break;
      case "enemy_avoidance":
        if (actionType === "enemy_avoidance" && data.enemyId) {
          const { data: enemy } = await supabaseAdmin
            .from("enemies")
            .select("total_avoided_days")
            .eq("id", data.enemyId)
            .single();

          isUnlocked =
            enemy.total_avoided_days >= achievement.condition_config.value;
        }
        break;
      default:
        break;
    }

    if (isUnlocked) {
      const { data: existingAchievement } = await supabaseAdmin
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId)
        .eq("achievement_id", achievement.id)
        .single();

      if (!existingAchievement) {
        await supabaseAdmin.from("user_achievements").insert([
          {
            user_id: userId,
            achievement_id: achievement.id,
            progress_value: achievement.condition_config.value,
            is_completed: true,
          },
        ]);

        achievementsUnlocked.push(achievement);
      }
    }
  }

  return achievementsUnlocked;
};

const getAchievements = async (userId) => {
  const { data: achievements, error } = await supabaseAdmin
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("user_id", userId);

  if (error) {
    throw new AppError(error.message, 400);
  }

  return achievements;
};

const getAvailableAchievements = async (userId) => {
  const { data: achievements, error } = await supabaseAdmin
    .from("achievements")
    .select("*")
    .eq("is_active", true);

  if (error) {
    throw new AppError(error.message, 400);
  }

  return achievements;
};

const claimAchievement = async (userId, achievementId) => {
  const { data: userAchievement, error: fetchError } = await supabaseAdmin
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("id", achievementId)
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    throw new AppError(fetchError.message, 400);
  }

  if (!userAchievement.is_completed) {
    throw new AppError("Achievement not completed", 400);
  }

  if (userAchievement.rewards_claimed) {
    throw new AppError("Rewards already claimed", 400);
  }

  // Apply rewards
  const rewards = userAchievement.achievements.reward_config;

  const updates = {
    in_app_currency: rewards.currency || 0,
    gems: rewards.gems || 0,
    total_xp: rewards.xp || 0,
  };

  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (updateError) {
    throw new AppError(updateError.message, 400);
  }

  // Mark rewards as claimed
  const { error: claimError } = await supabaseAdmin
    .from("user_achievements")
    .update({ rewards_claimed: true })
    .eq("id", achievementId);

  if (claimError) {
    throw new AppError(claimError.message, 400);
  }

  return { success: true };
};

module.exports = {
  checkAchievements,
  getAchievements,
  getAvailableAchievements,
  claimAchievement,
};
