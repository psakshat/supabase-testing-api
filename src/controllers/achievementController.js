const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const getAchievements = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: achievements, error } = await supabaseAdmin
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", userId);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        achievements,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableAchievements = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: achievements, error } = await supabaseAdmin
      .from("achievements")
      .select("*")
      .eq("is_active", true);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        achievements,
      },
    });
  } catch (error) {
    next(error);
  }
};

const claimAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Fetch achievement details
    const { data: userAchievement, error: fetchError } = await supabaseAdmin
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("id", id)
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
      in_app_currency: supabaseAdmin.rpc("increment_user_currency", {
        user_id: userId,
        amount: rewards.currency || 0,
      }),
      gems: supabaseAdmin.rpc("increment_user_gems", {
        user_id: userId,
        amount: rewards.gems || 0,
      }),
      total_xp: supabaseAdmin.rpc("increment_user_xp", {
        user_id: userId,
        xp_amount: rewards.xp || 0,
      }),
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
      .eq("id", id);

    if (claimError) {
      throw new AppError(claimError.message, 400);
    }

    res.status(200).json({
      status: "success",
      message: "Achievement rewards claimed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAchievements,
  getAvailableAchievements,
  claimAchievement,
};
