const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const getProfile = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const updates = req.body;

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// const getStats = async (req, res, next) => {
//   try {
//     const { userId } = req;
//     console.log("userId:", userId);

//     // Fetch user stats from the database
//     // This is a simplified example; you would need to implement the actual logic
//     const stats = {
//       totalXP: 1000,
//       level: 5,
//       tasksCompleted: 42,
//       streaks: 7,
//     };

//     res.status(200).json({
//       status: "success",
//       data: {
//         stats,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const getStats = async (req, res, next) => {
  try {
    const { userId } = req;

    // 1. Fetch basic user stats from `users`
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("overall_level, total_xp")
      .eq("id", userId)
      .single();

    if (userError) throw new AppError(userError.message, 400);

    // 2. Fetch task stats from `task_completion_stats`
    const { data: taskStats, error: statsError } = await supabaseAdmin
      .from("task_completion_stats")
      .select(
        "total_completions, current_streak, best_streak, completion_rate_percentage"
      )
      .eq("user_id", userId)
      .maybeSingle(); // just in case there's no entry yet

    if (statsError) throw new AppError(statsError.message, 400);

    const stats = {
      totalXP: user.total_xp || 0,
      level: user.overall_level || 1,
      tasksCompleted: taskStats?.total_completions || 0,
      streaks: taskStats?.current_streak || 0,
      bestStreak: taskStats?.best_streak || 0,
      completionRate: taskStats?.completion_rate_percentage || 0,
    };

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

// const uploadAvatar = async (req, res, next) => {
//   try {
//     const { userId } = req;
//     const { imageUrl } = req.body;

//     const { data: user, error } = await supabaseAdmin
//       .from("users")
//       .update({ profile_image_url: imageUrl })
//       .eq("id", userId)
//       .select()
//       .single();

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         user,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateSettings = async (req, res, next) => {
//   try {
//     const { userId } = req;
//     const settings = req.body;

//     const { data: user, error } = await supabaseAdmin
//       .from("users")
//       .update(settings)
//       .eq("id", userId)
//       .select()
//       .single();

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         user,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  // uploadAvatar,
  // updateSettings,
};
