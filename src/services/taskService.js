const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const { calculateLevel } = require("../utils/gameCalculations");
const { getStartOfDay, getEndOfDay } = require("../utils/dateHelpers");

const createTask = async (userId, taskData) => {
  const { data: task, error } = await supabaseAdmin
    .from("tasks")
    .insert([{ ...taskData, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return task;
};

const completeTask = async (taskId, userId) => {
  const { data: task, error: fetchError } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    throw new AppError(fetchError.message, 400);
  }

  // Calculate XP reward
  const xpReward = task.xp_reward || 100;

  // Update task completion
  const { error: updateError } = await supabaseAdmin
    .from("task_completions")
    .insert([
      {
        task_id: taskId,
        user_id: userId,
        completed_date: new Date().toISOString(),
        xp_earned: xpReward,
      },
    ]);

  if (updateError) {
    throw new AppError(updateError.message, 400);
  }

  // Update user XP
  const { error: userError } = await supabaseAdmin.rpc("increment_user_xp", {
    user_id: userId,
    xp_amount: xpReward,
  });

  if (userError) {
    throw new AppError(userError.message, 400);
  }

  // Update task streak
  const { data: completions } = await supabaseAdmin
    .from("task_completions")
    .select("*")
    .eq("task_id", taskId)
    .order("completed_date", { ascending: false })
    .limit(2);

  let currentStreak = 1;
  if (completions.length > 1) {
    const yesterday = getStartOfDay(new Date());
    yesterday.setDate(yesterday.getDate() - 1);
    const lastCompletionDate = new Date(completions[1].completed_date);

    if (lastCompletionDate >= yesterday) {
      currentStreak = task.current_streak + 1;
    }
  }

  const { error: streakError } = await supabaseAdmin
    .from("tasks")
    .update({
      current_streak: currentStreak,
      best_streak:
        currentStreak > task.best_streak ? currentStreak : task.best_streak,
      total_completions: task.total_completions + 1,
    })
    .eq("id", taskId);

  if (streakError) {
    throw new AppError(streakError.message, 400);
  }

  return { success: true };
};

const calculateTaskReward = (task, streak) => {
  return task.xp_reward * (1 + streak * 0.1);
};

const updateTaskStreak = async (taskId, isCompleted) => {
  const { data: task, error } = await supabaseAdmin
    .from("tasks")
    .select("current_streak, best_streak")
    .eq("id", taskId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  let currentStreak = task.current_streak;
  let bestStreak = task.best_streak;

  if (isCompleted) {
    currentStreak += 1;
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  } else {
    currentStreak = 0;
  }

  const { error: updateError } = await supabaseAdmin
    .from("tasks")
    .update({ current_streak: currentStreak, best_streak: bestStreak })
    .eq("id", taskId);

  if (updateError) {
    throw new AppError(updateError.message, 400);
  }

  return { currentStreak, bestStreak };
};

const getTasksForDate = async (userId, date) => {
  const startOfDay = getStartOfDay(new Date(date));
  const endOfDay = getEndOfDay(new Date(date));

  const { data: tasks, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) {
    throw new AppError(error.message, 400);
  }

  // Filter tasks based on the date and frequency
  const filteredTasks = tasks.filter((task) => {
    if (task.frequency_type === "daily") {
      return true;
    } else if (task.frequency_type === "weekly") {
      const dayOfWeek = startOfDay.getDay();
      return task.frequency_config.days.includes(dayOfWeek);
    } else if (task.frequency_type === "monthly") {
      const dayOfMonth = startOfDay.getDate();
      return task.frequency_config.days.includes(dayOfMonth);
    } else if (task.frequency_type === "specific_days") {
      const dayOfWeek = startOfDay.getDay();
      return task.frequency_config.days.includes(dayOfWeek);
    } else if (task.frequency_type === "one_time") {
      return (
        new Date(task.frequency_config.date) >= startOfDay &&
        new Date(task.frequency_config.date) <= endOfDay
      );
    }
    return false;
  });

  return filteredTasks;
};

const checkTaskReminders = async () => {
  const now = new Date();
  const { data: tasks, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("is_active", true);

  if (error) {
    throw new AppError(error.message, 400);
  }

  const tasksNeedingReminders = tasks.filter((task) => {
    // Implement your logic to determine if a task needs a reminder
    return true;
  });

  return tasksNeedingReminders;
};

module.exports = {
  createTask,
  completeTask,
  calculateTaskReward,
  updateTaskStreak,
  getTasksForDate,
  checkTaskReminders,
};
