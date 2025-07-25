const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const userService = require("./userService");
const skillService = require("./skillService");
const taskService = require("./taskService");
const enemyService = require("./enemyService");
const achievementService = require("./achievementService");
const notificationService = require("./notificationService");

const processTaskCompletion = async (taskId, userId) => {
  const task = await taskService.completeTask(taskId, userId);
  await userService.checkLevelUp(userId);
  await achievementService.checkAchievements(userId, "task_completion", {
    taskId,
  });
  await notificationService.scheduleTaskReminder(task);
  return task;
};

const processEnemyTrigger = async (enemyId, userId) => {
  const enemy = await enemyService.triggerEnemy(enemyId, userId);
  await userService.checkLevelUp(userId);
  await achievementService.checkAchievements(userId, "enemy_trigger", {
    enemyId,
  });
  return enemy;
};

const checkAchievements = async (userId, actionType, data) => {
  const achievementsUnlocked = await achievementService.checkAchievements(
    userId,
    actionType,
    data
  );
  return achievementsUnlocked;
};

const applyDifficultyModifiers = (baseValue, difficulty) => {
  const modifiers = {
    easy: 1.5,
    normal: 1.0,
    hard: 0.7,
  };

  return baseValue * (modifiers[difficulty] || 1.0);
};

const handleLevelUp = async (userId, entityType, entityId) => {
  if (entityType === "user") {
    await notificationService.createSystemNotification(userId, "level_up", {
      title: "Level Up!",
      message: "Congratulations! You have leveled up.",
    });
  } else if (entityType === "skill") {
    // Handle skill level up
  } else if (entityType === "task") {
    // Handle task level up
  }
  return { success: true };
};

module.exports = {
  processTaskCompletion,
  processEnemyTrigger,
  checkAchievements,
  applyDifficultyModifiers,
  handleLevelUp,
};
