module.exports = {
  // Game Difficulties
  GAME_DIFFICULTIES: {
    EASY: "easy",
    NORMAL: "normal",
    HARD: "hard",
  },

  // Task Frequencies
  TASK_FREQUENCIES: {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    SPECIFIC_DAYS: "specific_days",
    ONE_TIME: "one_time",
  },

  // Power-up Effects
  POWERUP_EFFECTS: {
    HP_RESTORE: "hp_restore",
    XP_BOOST: "xp_boost",
    EXTRA_LIFE: "extra_life",
  },

  // Achievement Categories
  ACHIEVEMENT_CATEGORIES: {
    CONSISTENCY: "consistency",
    MILESTONE: "milestone",
    CHALLENGE: "challenge",
    RECOVERY: "recovery",
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    TASK_REMINDER: "task_reminder",
    LEVEL_UP: "level_up",
    ACHIEVEMENT: "achievement",
    PUNISHMENT: "punishment",
    HP_LOW: "hp_low",
  },

  // Default Values
  DEFAULT_HP: 100,
  DEFAULT_CURRENCY: 100,
  DEFAULT_GEMS: 0,
  HP_DECAY_RATE: 5,

  // XP Multipliers by Difficulty
  XP_MULTIPLIERS: {
    easy: 1.5,
    normal: 1.0,
    hard: 0.7,
  },

  // HP Reduction Multipliers by Difficulty
  HP_MULTIPLIERS: {
    easy: 0.5,
    normal: 1.0,
    hard: 1.5,
  },
};
