const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const { calculateLevel } = require("../utils/gameCalculations");

const createSkill = async (userId, skillData) => {
  const { data: skill, error } = await supabaseAdmin
    .from("skills")
    .insert([{ ...skillData, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return skill;
};

const getSkillsByUser = async (userId) => {
  const { data: skills, error } = await supabaseAdmin
    .from("skills")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new AppError(error.message, 400);
  }

  return skills;
};

const updateSkillXP = async (skillId, xpAmount) => {
  const { data: skill, error } = await supabaseAdmin.rpc("increment_skill_xp", {
    skill_id: skillId,
    xp_amount: xpAmount,
  });

  if (error) {
    throw new AppError(error.message, 400);
  }

  // Check if the skill has leveled up
  const newLevel = calculateLevel(
    skill.current_xp,
    skill.base_xp,
    skill.growth_multiplier
  );
  if (newLevel > skill.level) {
    await supabaseAdmin
      .from("skills")
      .update({ level: newLevel })
      .eq("id", skillId);
  }

  return skill;
};

const calculateLevelRequirement = (skill, level) => {
  if (skill.xp_config_type === "custom" && skill.custom_xp_levels) {
    return skill.custom_xp_levels[level - 1] || 0;
  }

  // Default formula-based calculation
  return Math.ceil(
    skill.base_xp * Math.pow(skill.growth_multiplier, level - 1)
  );
};

const getSkillStats = async (skillId, timeframe = "all") => {
  const { data: skill, error } = await supabaseAdmin
    .from("skills")
    .select("*")
    .eq("id", skillId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  // Fetch additional stats based on timeframe
  // This is a simplified example; you would need to implement the actual logic
  const stats = {
    totalXP: skill.current_xp,
    level: skill.level,
    tasksCompleted: 20, // Example value
  };

  return stats;
};

module.exports = {
  createSkill,
  getSkillsByUser,
  updateSkillXP,
  calculateLevelRequirement,
  getSkillStats,
};
