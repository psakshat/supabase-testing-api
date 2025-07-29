const Joi = require("joi");
const { AppError } = require("./errorHandler");

// No need for icon_url validator here, we validate `icon` as a string (emoji)
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new AppError(`Validation error: ${errorMessages.join(", ")}`, 400);
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  // User schemas
  registerUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    title: Joi.string().max(50).optional(),
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    title: Joi.string().max(50).optional(),
    rank: Joi.string().max(20).optional(),
  }),

  // Skill schemas
  // createSkill: Joi.object({
  //   name: Joi.string().min(1).max(100).required(),
  //   description: Joi.string().max(500).optional(),
  //   // icon_url: Joi.string().uri().optional(),
  //   xp_config_type: Joi.string().valid("formula", "custom").default("formula"),
  //   base_xp: Joi.number().integer().min(1).default(100),
  //   growth_multiplier: Joi.number().min(1).default(1.5),
  //   custom_xp_levels: Joi.array()
  //     .items(Joi.number().integer().min(1))
  //     .optional(),
  // }),
  // Skill schemas
  createSkill: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    icon: Joi.string().optional(), // Accept icon emoji from frontend
    xp_config_type: Joi.string().valid("formula", "custom").default("formula"),
    base_xp: Joi.number().integer().min(1).default(100),
    growth_multiplier: Joi.number().min(1).default(1.5),
    custom_xp_levels: Joi.array()
      .items(Joi.number().integer().min(1))
      .optional(),
  }),

  // Task schemas
  createTask: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    difficulty_rating: Joi.number().integer().min(1).max(5).default(1),
    frequency_type: Joi.string()
      .valid("daily", "weekly", "monthly", "specific_days", "one_time")
      .required(),
    frequency_config: Joi.object().optional(),
    punishment_hp_reduction: Joi.number().integer().min(0).default(0),
    // skill_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }),

  // Enemy schemas
  createEnemy: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    icon_url: Joi.string().uri().optional(),
    hp_reduction: Joi.number().integer().min(1).max(1000).required(),
    last_triggered_date: Joi.date().optional(),
  }),

  // Power-up schemas
  createPowerUp: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    effect_type: Joi.string()
      .valid("hp_restore", "xp_boost", "extra_life")
      .required(),
    effect_value: Joi.number().integer().min(1).required(),
    cost_currency: Joi.number().integer().min(0).optional(),
    cost_gems: Joi.number().integer().min(0).optional(),
    usage_limit_per_day: Joi.number().integer().min(1).optional(),
    cooldown_hours: Joi.number().integer().min(0).optional(),
  }),
};

module.exports = {
  validateRequest,
  schemas,
};
