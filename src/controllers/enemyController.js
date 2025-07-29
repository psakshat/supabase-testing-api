// const { supabaseAdmin } = require("../config/supabase");
// const { AppError } = require("../middleware/errorHandler");

// const getEnemies = async (req, res, next) => {
//   try {
//     const { userId } = req;

//     const { data: enemies, error } = await supabaseAdmin
//       .from("enemies")
//       .select("*")
//       .eq("user_id", userId);

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     // Add total_streaks field (days since created_at)
//     const enrichedEnemies = enemies.map((enemy) => {
//       const createdAt = new Date(enemy.created_at);
//       const today = new Date();

//       const diffTime = today - createdAt;
//       const totalStreaks = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//       return {
//         ...enemy,
//         total_streaks: totalStreaks,
//       };
//     });

//     res.status(200).json({
//       status: "success",
//       data: {
//         enemies: enrichedEnemies,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const createEnemy = async (req, res, next) => {
//   try {
//     const { userId } = req;
//     const enemyData = req.body;

//     const { data: enemy, error } = await supabaseAdmin
//       .from("enemies")
//       .insert([{ ...enemyData, user_id: userId }])
//       .select()
//       .single();

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(201).json({
//       status: "success",
//       data: {
//         enemy,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getEnemy = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;

//     const { data: enemy, error } = await supabaseAdmin
//       .from("enemies")
//       .select("*")
//       .eq("id", id)
//       .eq("user_id", userId)
//       .single();

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     // Add total_streaks
//     const createdAt = new Date(enemy.created_at);
//     const today = new Date();
//     const diffTime = today - createdAt;
//     const totalStreaks = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//     res.status(200).json({
//       status: "success",
//       data: {
//         enemy: {
//           ...enemy,
//           total_streaks: totalStreaks,
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateEnemy = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;
//     const updates = req.body;

//     const { data, error } = await supabaseAdmin
//       .from("enemies")
//       .update(updates)
//       .eq("id", id)
//       .eq("user_id", userId)
//       .select();

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     if (!data || data.length !== 1) {
//       throw new AppError("Enemy not found or update failed", 404);
//     }

//     const enemy = data[0];

//     // Add total_streaks after update
//     const createdAt = new Date(enemy.created_at);
//     const today = new Date();
//     const diffTime = today - createdAt;
//     const totalStreaks = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//     res.status(200).json({
//       status: "success",
//       data: {
//         enemy: {
//           ...enemy,
//           total_streaks: totalStreaks,
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteEnemy = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;

//     const { error } = await supabaseAdmin
//       .from("enemies")
//       .delete()
//       .eq("id", id)
//       .eq("user_id", userId);

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const triggerEnemy = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;

//     const { data: enemy, error: fetchError } = await supabaseAdmin
//       .from("enemies")
//       .select("*")
//       .eq("id", id)
//       .eq("user_id", userId)
//       .single();

//     if (fetchError) {
//       throw new AppError(fetchError.message, 400);
//     }

//     const hpReduction = enemy.hp_reduction || 10;

//     const { error: updateError } = await supabaseAdmin
//       .from("enemy_triggers")
//       .insert([
//         {
//           enemy_id: id,
//           user_id: userId,
//           triggered_date: new Date().toISOString(),
//           hp_lost: hpReduction,
//         },
//       ]);

//     if (updateError) {
//       throw new AppError(updateError.message, 400);
//     }

//     const { error: userError } = await supabaseAdmin.rpc("decrement_user_hp", {
//       user_id: userId,
//       hp_amount: hpReduction,
//     });

//     if (userError) {
//       throw new AppError(userError.message, 400);
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Enemy triggered successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getEnemyStats = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;

//     // Example response (replace with actual logic if needed)
//     const stats = {
//       totalTriggers: 5,
//       currentStreak: 2,
//       bestStreak: 10,
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

// module.exports = {
//   getEnemies,
//   createEnemy,
//   getEnemy,
//   updateEnemy,
//   deleteEnemy,
//   triggerEnemy,
//   getEnemyStats,
// };
const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

// Utility to calculate total streaks
const calculateStreaks = (createdAt) => {
  const today = new Date();
  const created = new Date(createdAt);
  const diffTime = today - created;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Get all enemies
const getEnemies = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: enemies, error } = await supabaseAdmin
      .from("enemies")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new AppError("Failed to fetch enemies", 400);

    const enrichedEnemies = enemies.map((enemy) => ({
      ...enemy,
      total_streaks: calculateStreaks(enemy.created_at),
    }));

    res
      .status(200)
      .json({ status: "success", data: { enemies: enrichedEnemies } });
  } catch (error) {
    next(error);
  }
};

// Create new enemy
const createEnemy = async (req, res, next) => {
  try {
    const { userId } = req;
    const enemyData = req.body;

    const { data: enemy, error } = await supabaseAdmin
      .from("enemies")
      .insert([{ ...enemyData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError(`Creation failed: ${error.message}`, 400);

    res.status(201).json({ status: "success", data: { enemy } });
  } catch (error) {
    next(error);
  }
};

// Get enemy by ID
const getEnemy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { data: enemy, error } = await supabaseAdmin
      .from("enemies")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !enemy) throw new AppError("Enemy not found", 404);

    res.status(200).json({
      status: "success",
      data: {
        enemy: { ...enemy, total_streaks: calculateStreaks(enemy.created_at) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update enemy
const updateEnemy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from("enemies")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) throw new AppError(`Update failed: ${error.message}`, 400);
    if (!data || data.length === 0) throw new AppError("Enemy not found", 404);

    const enemy = data[0];

    res.status(200).json({
      status: "success",
      data: {
        enemy: {
          ...enemy,
          total_streaks: calculateStreaks(enemy.created_at),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete enemy
const deleteEnemy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { error } = await supabaseAdmin
      .from("enemies")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new AppError(`Delete failed: ${error.message}`, 400);

    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};

// Trigger enemy (bad habit)
const triggerEnemy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { data: enemy, error: fetchError } = await supabaseAdmin
      .from("enemies")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !enemy) throw new AppError("Enemy not found", 404);

    const hpReduction = enemy.hp_reduction || 10;

    const { error: insertError } = await supabaseAdmin
      .from("enemy_triggers")
      .insert([
        {
          enemy_id: id,
          user_id: userId,
          triggered_date: new Date().toISOString(),
          hp_lost: hpReduction,
        },
      ]);

    if (insertError) throw new AppError("Failed to log trigger", 500);

    const { error: userError } = await supabaseAdmin.rpc("decrement_user_hp", {
      user_id: userId,
      hp_amount: hpReduction,
    });

    if (userError) throw new AppError("Failed to reduce HP", 500);

    res.status(200).json({
      status: "success",
      message: "Enemy triggered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Enemy stats (placeholder)
const getEnemyStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // TODO: Implement real stats logic
    const stats = {
      totalTriggers: 5,
      currentStreak: 2,
      bestStreak: 10,
    };

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEnemies,
  createEnemy,
  getEnemy,
  updateEnemy,
  deleteEnemy,
  triggerEnemy,
  getEnemyStats,
};
