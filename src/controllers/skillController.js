// const { supabaseAdmin } = require("../config/supabase");
// const { AppError } = require("../middleware/errorHandler");
// const iconMap = require("../utils/iconMap.js");

// const getSkills = async (req, res, next) => {
//   try {
//     const { userId } = req;

//     const { data: skills, error } = await supabaseAdmin
//       .from("skills")
//       .select("*")
//       .eq("user_id", userId);

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         skills,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const createSkill = async (req, res, next) => {
//   try {
//     const { userId } = req;
//     const skillData = req.body;

//     const { data: skill, error } = await supabaseAdmin
//       .from("skills")
//       .insert([{ ...skillData, user_id: userId }])
//       .select()
//       .single();

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(201).json({
//       status: "success",
//       data: {
//         skill,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getSkill = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;

//     const { data: skill, error } = await supabaseAdmin
//       .from("skills")
//       .select("*")
//       .eq("id", id)
//       .eq("user_id", userId)
//       .single();

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         skill,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateSkill = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;
//     const updates = req.body;

//     const { data: skill, error } = await supabaseAdmin
//       .from("skills")
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
//         skill,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteSkill = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;

//     const { error } = await supabaseAdmin
//       .from("skills")
//       .delete()
//       .eq("id", id)
//       .eq("user_id", userId);

//     if (error) {
//       throw new AppError(error.message, 400);
//     }

//     res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // const getSkillStats = async (req, res, next) => {
// //   try {
// //     const { id } = req.params;
// //     const { userId } = req;

// //     // Fetch skill stats from the database
// //     // This is a simplified example; you would need to implement the actual logic
// //     const stats = {
// //       totalXP: 500,
// //       level: 3,
// //       tasksCompleted: 20,
// //     };

// //     res.status(200).json({
// //       status: "success",
// //       data: {
// //         stats,
// //       },
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };
// const getSkillStats = async (req, res, next) => {
//   try {
//     const { id: skillId } = req.params;
//     const { userId } = req;

//     // 1. Find all task IDs related to this skill
//     const { data: taskSkillLinks, error: linkError } = await supabaseAdmin
//       .from("task_skills")
//       .select("task_id")
//       .eq("skill_id", skillId);

//     if (linkError) throw new AppError(linkError.message, 400);

//     const taskIds = taskSkillLinks.map((link) => link.task_id);

//     if (taskIds.length === 0) {
//       return res.status(200).json({
//         status: "success",
//         data: {
//           stats: {
//             totalXP: 0,
//             level: 1,
//             tasksCompleted: 0,
//           },
//         },
//       });
//     }

//     // 2. Fetch task completions for those tasks by this user
//     const { data: completions, error: completionError } = await supabaseAdmin
//       .from("task_completions")
//       .select("xp_earned")
//       .in("task_id", taskIds)
//       .eq("user_id", userId);

//     if (completionError) throw new AppError(completionError.message, 400);

//     const totalXP = completions.reduce((sum, t) => sum + (t.xp_earned || 0), 0);
//     const tasksCompleted = completions.length;

//     // 3. Level can be derived from XP if you want (simple static formula)
//     const level = Math.floor(totalXP / 100) + 1;

//     res.status(200).json({
//       status: "success",
//       data: {
//         stats: {
//           totalXP,
//           level,
//           tasksCompleted,
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   getSkills,
//   createSkill,
//   getSkill,
//   updateSkill,
//   deleteSkill,
//   getSkillStats,
// };
const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const iconMap = require("../utils/iconMap.js");

const emojiToIconUrl = iconMap;
const iconUrlToEmoji = Object.entries(iconMap).reduce((acc, [emoji, url]) => {
  acc[url] = emoji;
  return acc;
}, {});

const getSkills = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: skills, error } = await supabaseAdmin
      .from("skills")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new AppError(error.message, 400);

    // Add emoji property to each skill for frontend convenience
    const skillsWithEmoji = skills.map((skill) => ({
      ...skill,
      emoji: iconUrlToEmoji[skill.icon_url] || null,
    }));

    res.status(200).json({
      status: "success",
      data: { skills: skillsWithEmoji },
    });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const { userId } = req;
    const skillData = req.body;

    // Convert icon emoji to icon_url for storing
    let iconUrl = null;
    if (skillData.icon && emojiToIconUrl[skillData.icon]) {
      iconUrl = emojiToIconUrl[skillData.icon];
    }

    // Remove icon from insert (only icon_url stored)
    const { icon, ...restData } = skillData;

    const { data: skill, error } = await supabaseAdmin
      .from("skills")
      .insert([{ ...restData, icon_url: iconUrl, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    // Return skill with emoji for frontend convenience
    const skillWithEmoji = {
      ...skill,
      emoji: iconUrlToEmoji[skill.icon_url] || null,
    };

    res.status(201).json({
      status: "success",
      data: { skill: skillWithEmoji },
    });
  } catch (error) {
    next(error);
  }
};

const getSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { data: skill, error } = await supabaseAdmin
      .from("skills")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw new AppError(error.message, 400);

    const skillWithEmoji = {
      ...skill,
      emoji: iconUrlToEmoji[skill.icon_url] || null,
    };

    res.status(200).json({
      status: "success",
      data: { skill: skillWithEmoji },
    });
  } catch (error) {
    next(error);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const updates = req.body;

    // If icon emoji sent, convert to icon_url
    if (updates.icon && emojiToIconUrl[updates.icon]) {
      updates.icon_url = emojiToIconUrl[updates.icon];
    }

    // Remove icon from update so only icon_url is stored
    delete updates.icon;

    const { data: skill, error } = await supabaseAdmin
      .from("skills")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    const skillWithEmoji = {
      ...skill,
      emoji: iconUrlToEmoji[skill.icon_url] || null,
    };

    res.status(200).json({
      status: "success",
      data: { skill: skillWithEmoji },
    });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { error } = await supabaseAdmin
      .from("skills")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const getSkillStats = async (req, res, next) => {
  try {
    const { id: skillId } = req.params;
    const { userId } = req;

    // Get all task IDs linked to this skill
    const { data: taskSkillLinks, error: linkError } = await supabaseAdmin
      .from("task_skills")
      .select("task_id")
      .eq("skill_id", skillId);

    if (linkError) throw new AppError(linkError.message, 400);

    const taskIds = taskSkillLinks.map((link) => link.task_id);

    if (taskIds.length === 0) {
      // No tasks linked to this skill, so stats are zero
      return res.status(200).json({
        status: "success",
        data: {
          stats: {
            totalXP: 0,
            level: 1,
            tasksCompleted: 0,
          },
        },
      });
    }

    // Get all completions for these tasks by this user
    const { data: completions, error: completionError } = await supabaseAdmin
      .from("task_completions")
      .select("xp_earned")
      .in("task_id", taskIds)
      .eq("user_id", userId);

    if (completionError) throw new AppError(completionError.message, 400);

    // Calculate total XP earned
    const totalXP = completions.reduce((sum, t) => sum + (t.xp_earned || 0), 0);

    // Number of tasks completed is the count of completions
    const tasksCompleted = completions.length;

    // Level calculated by XP, e.g., every 100 XP = 1 level increment
    const level = Math.floor(totalXP / 100) + 1;

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalXP,
          level,
          tasksCompleted,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  createSkill,
  getSkill,
  updateSkill,
  deleteSkill,
  getSkillStats,
};
