const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const getDashboardData = async (req, res, next) => {
  try {
    const { userId } = req;

    // Fetch dashboard data from the database
    // This is a simplified example; you would need to implement the actual logic
    const dashboardData = {
      totalXP: 1000,
      level: 5,
      tasksCompleted: 42,
      streaks: 7,
      achievementsUnlocked: 10,
      currentHP: 75,
      maxHP: 100,
    };

    res.status(200).json({
      status: "success",
      data: {
        dashboardData,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getXpHistory = async (req, res, next) => {
  try {
    const { userId } = req;

    // Fetch XP history from the database
    // This is a simplified example; you would need to implement the actual logic
    const xpHistory = [
      { date: "2023-01-01", xp: 100 },
      { date: "2023-01-02", xp: 200 },
      { date: "2023-01-03", xp: 150 },
    ];

    res.status(200).json({
      status: "success",
      data: {
        xpHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCompletionRates = async (req, res, next) => {
  try {
    const { userId } = req;

    // Fetch completion rates from the database
    // This is a simplified example; you would need to implement the actual logic
    const completionRates = {
      daily: 85,
      weekly: 90,
      monthly: 88,
    };

    res.status(200).json({
      status: "success",
      data: {
        completionRates,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getXpHistory,
  getCompletionRates,
};
