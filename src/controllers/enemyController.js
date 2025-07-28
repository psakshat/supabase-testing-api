const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const getEnemies = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: enemies, error } = await supabaseAdmin
      .from("enemies")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        enemies,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createEnemy = async (req, res, next) => {
  try {
    const { userId } = req;
    const enemyData = req.body;

    const { data: enemy, error } = await supabaseAdmin
      .from("enemies")
      .insert([{ ...enemyData, user_id: userId }])
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      status: "success",
      data: {
        enemy,
      },
    });
  } catch (error) {
    next(error);
  }
};

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

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        enemy,
      },
    });
  } catch (error) {
    next(error);
  }
};

// const updateEnemy = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;
//     const updates = req.body;

//     const { data: enemy, error } = await supabaseAdmin
//       .from("enemies")
//       .update(updates)
//       .eq("id", id)
//       .eq("user_id", userId)
//       .select()
//       .single();

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         enemy,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
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

    if (error) {
      throw new AppError(error.message, 400);
    }

    // Check if a single enemy was updated
    if (!data || data.length !== 1) {
      throw new AppError("Enemy not found or update failed", 404);
    }

    const enemy = data[0];

    res.status(200).json({
      status: "success",
      data: {
        enemy,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteEnemy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { error } = await supabaseAdmin
      .from("enemies")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const triggerEnemy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Fetch enemy details
    const { data: enemy, error: fetchError } = await supabaseAdmin
      .from("enemies")
      .select("*")
      .eq("id", id)
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
          enemy_id: id,
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

    res.status(200).json({
      status: "success",
      message: "Enemy triggered successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getEnemyStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Fetch enemy stats from the database
    // This is a simplified example; you would need to implement the actual logic
    const stats = {
      totalTriggers: 5,
      currentStreak: 2,
      bestStreak: 10,
    };

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
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
