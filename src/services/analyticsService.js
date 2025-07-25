const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const getDashboardData = async (userId) => {
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select(
      "total_xp, overall_level, current_hp, max_hp, in_app_currency, gems"
    )
    .eq("id", userId)
    .single();

  if (userError) {
    throw new AppError(userError.message, 400);
  }

  const { data: tasks, error: tasksError } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (tasksError) {
    throw new AppError(tasksError.message, 400);
  }

  const { data: skills, error: skillsError } = await supabaseAdmin
    .from("skills")
    .select("*")
    .eq("user_id", userId);

  if (skillsError) {
    throw new AppError(skillsError.message, 400);
  }

  const { data: achievements, error: achievementsError } = await supabaseAdmin
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("is_completed", true);

  if (achievementsError) {
    throw new AppError(achievementsError.message, 400);
  }

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

const getXpHistory = async (userId) => {
  const { data: completions, error } = await supabaseAdmin
    .from("task_completions")
    .select("completed_date, xp_earned")
    .eq("user_id", userId)
    .order("completed_date", { ascending: false });

  if (error) {
    throw new AppError(error.message, 400);
  }

  const xpHistory = completions.map((completion) => ({
    date: completion.completed_date,
    xp: completion.xp_earned,
  }));

  return xpHistory;
};

const getCompletionRates = async (userId) => {
  const { data: tasks, error: tasksError } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (tasksError) {
    throw new AppError(tasksError.message, 400);
  }

  const { data: completions, error: completionsError } = await supabaseAdmin
    .from("task_completions")
    .select("*")
    .eq("user_id", userId);

  if (completionsError) {
    throw new AppError(completionsError.message, 400);
  }

  const dailyCompletionRate = calculateDailyCompletionRate(tasks, completions);
  const weeklyCompletionRate = calculateWeeklyCompletionRate(
    tasks,
    completions
  );
  const monthlyCompletionRate = calculateMonthlyCompletionRate(
    tasks,
    completions
  );

  return {
    daily: dailyCompletionRate,
    weekly: weeklyCompletionRate,
    monthly: monthlyCompletionRate,
  };
};

const calculateDailyCompletionRate = (tasks, completions) => {
  const dailyTasks = tasks.filter((task) => task.frequency_type === "daily");
  const dailyCompletions = completions.filter((completion) =>
    dailyTasks.some((task) => task.id === completion.task_id)
  );

  if (dailyTasks.length === 0) return 0;
  return Math.round((dailyCompletions.length / dailyTasks.length) * 100);
};

const calculateWeeklyCompletionRate = (tasks, completions) => {
  const weeklyTasks = tasks.filter((task) => task.frequency_type === "weekly");
  const weeklyCompletions = completions.filter((completion) =>
    weeklyTasks.some((task) => task.id === completion.task_id)
  );

  if (weeklyTasks.length === 0) return 0;
  return Math.round((weeklyCompletions.length / weeklyTasks.length) * 100);
};

const calculateMonthlyCompletionRate = (tasks, completions) => {
  const monthlyTasks = tasks.filter(
    (task) => task.frequency_type === "monthly"
  );
  const monthlyCompletions = completions.filter((completion) =>
    monthlyTasks.some((task) => task.id === completion.task_id)
  );

  if (monthlyTasks.length === 0) return 0;
  return Math.round((monthlyCompletions.length / monthlyTasks.length) * 100);
};

module.exports = {
  getDashboardData,
  getXpHistory,
  getCompletionRates,
};
