const { AppError } = require("../middleware/errorHandler");
const { supabaseAdmin } = require("../config/supabase");

const verifyWalkingDistance = async (userId, requiredKm, timeframe) => {
  // This is a simplified example; you would need to implement the actual logic
  // For example, integrating with Apple HealthKit or Google Fit APIs
  return { success: true, distance: requiredKm };
};

const syncHealthData = async (userId) => {
  // This is a simplified example; you would need to implement the actual logic
  // For example, integrating with Apple HealthKit or Google Fit APIs
  return { success: true };
};

const validatePunishmentCompletion = async (userId, distanceData) => {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("punishment_distance_km")
    .eq("id", userId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  if (distanceData.distance >= user.punishment_distance_km) {
    await supabaseAdmin
      .from("users")
      .update({
        is_punished: false,
        punishment_distance_km: 0,
      })
      .eq("id", userId);

    return { success: true };
  }

  return { success: false, message: "Distance not yet completed" };
};

module.exports = {
  verifyWalkingDistance,
  syncHealthData,
  validatePunishmentCompletion,
};
