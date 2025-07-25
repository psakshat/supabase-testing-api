const { XP_MULTIPLIERS, HP_MULTIPLIERS } = require("./constants");

const calculateXP = (baseXP, difficulty) => {
  const multiplier = XP_MULTIPLIERS[difficulty] || 1.0;
  return Math.ceil(baseXP * multiplier);
};

const calculateHPReduction = (baseHPReduction, difficulty) => {
  const multiplier = HP_MULTIPLIERS[difficulty] || 1.0;
  return Math.ceil(baseHPReduction * multiplier);
};

const calculateLevel = (totalXP, baseXP = 100, growthMultiplier = 1.5) => {
  let level = 1;
  let xpNeeded = 0;

  while (xpNeeded < totalXP) {
    level += 1;
    xpNeeded += Math.ceil(baseXP * Math.pow(growthMultiplier, level - 2));
  }

  return level - 1;
};

const calculateXPForLevel = (level, baseXP = 100, growthMultiplier = 1.5) => {
  if (level === 1) return 0;

  let xpNeeded = 0;
  for (let i = 1; i < level; i++) {
    xpNeeded += Math.ceil(baseXP * Math.pow(growthMultiplier, i - 1));
  }

  return xpNeeded;
};

module.exports = {
  calculateXP,
  calculateHPReduction,
  calculateLevel,
  calculateXPForLevel,
};
