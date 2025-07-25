const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const getTasks = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: tasks, error } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { userId } = req;
    const taskData = req.body;

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .insert([{ ...taskData, user_id: userId }])
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
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
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const updates = req.body;

    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { error } = await supabaseAdmin
      .from("tasks")
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

// const completeTask = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;

//     // Fetch task details
//     const { data: task, error: fetchError } = await supabaseAdmin
//       .from("tasks")
//       .select("*")
//       .eq("id", id)
//       .eq("user_id", userId)
//       .single();

//     if (fetchError) {
//       throw new AppError(fetchError.message, 400);
//     }

//     // Calculate XP reward
//     const xpReward = task.xp_reward || 100;

//     // Update task completion
//     const { error: updateError } = await supabaseAdmin
//       .from("task_completions")
//       .insert([
//         {
//           task_id: id,
//           user_id: userId,
//           completed_date: new Date().toISOString(),
//           xp_earned: xpReward,
//         },
//       ]);

//     if (updateError) {
//       throw new AppError(updateError.message, 400);
//     }

//     // Update user XP
//     const { error: userError } = await supabaseAdmin.rpc("increment_user_xp", {
//       user_id: userId,
//       xp_amount: xpReward,
//     });

//     if (userError) {
//       throw new AppError(userError.message, 400);
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Task completed successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Fetch task details
    const { data: task, error: fetchError } = await supabaseAdmin
      .from("tasks")
      .select("xp_reward")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      throw new AppError(fetchError.message, 400);
    }

    // Debug log task.xp_reward to confirm what we have
    console.log("Fetched xp_reward:", task.xp_reward);

    // Ensure xp_reward is a valid number and > 0, otherwise default 100
    let xpReward = 100;
    if (
      typeof task.xp_reward === "number" &&
      !isNaN(task.xp_reward) &&
      task.xp_reward > 0
    ) {
      xpReward = task.xp_reward;
    }

    // Debug log xpReward before insert
    console.log("Using xpReward:", xpReward);

    // Insert into task_completions with guaranteed xp_earned value
    const { error: updateError } = await supabaseAdmin
      .from("task_completions")
      .insert([
        {
          task_id: id,
          user_id: userId,
          completed_date: new Date().toISOString(),
          xp_earned: xpReward,
        },
      ]);

    if (updateError) {
      throw new AppError(updateError.message, 400);
    }

    // Call RPC function to increment user XP (adjust params if needed)
    const { error: userError } = await supabaseAdmin.rpc("increment_user_xp", {
      user_id: userId,
      xp_amount: xpReward,
    });

    if (userError) {
      throw new AppError(userError.message, 400);
    }

    res.status(200).json({
      status: "success",
      message: "Task completed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Fetch task stats from the database
    // This is a simplified example; you would need to implement the actual logic
    const stats = {
      totalCompletions: 10,
      currentStreak: 3,
      bestStreak: 7,
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

// const getTasksForDate = async (req, res, next) => {
//   try {
//     const { date } = req.params;
//     const { userId } = req;

//     // Fetch tasks for the specified date
//     // This is a simplified example; you would need to implement the actual logic
//     const tasks = [
//       { id: 1, name: "Task 1", description: "Description for Task 1" },
//       { id: 2, name: "Task 2", description: "Description for Task 2" },
//     ];

//     res.status(200).json({
//       status: "success",
//       data: {
//         tasks,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const getTasksForDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { userId } = req;

    const { data: tasks, error } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("due_date", date); // adjust field as per your schema

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
  getTaskStats,
  getTasksForDate,
};
