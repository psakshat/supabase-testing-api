const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const getPunishmentStatus = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("is_punished, punishment_distance_km")
      .eq("id", userId)
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        isPunished: user.is_punished,
        punishmentDistanceKm: user.punishment_distance_km,
      },
    });
  } catch (error) {
    next(error);
  }
};

const completePunishment = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError) {
      throw new AppError(fetchError.message, 400);
    }

    if (!user.is_punished) {
      throw new AppError("User is not currently punished", 400);
    }

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        is_punished: false,
        punishment_distance_km: 0,
        current_hp: user.max_hp,
      })
      .eq("id", userId);

    if (updateError) {
      throw new AppError(updateError.message, 400);
    }

    res.status(200).json({
      status: "success",
      message: "Punishment completed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const verifyDistance = async (req, res, next) => {
  try {
    const { userId } = req;
    const { distance } = req.body;

    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("punishment_distance_km")
      .eq("id", userId)
      .single();

    if (fetchError) {
      throw new AppError(fetchError.message, 400);
    }

    if (distance >= user.punishment_distance_km) {
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          is_punished: false,
          punishment_distance_km: 0,
        })
        .eq("id", userId);

      if (updateError) {
        throw new AppError(updateError.message, 400);
      }

      res.status(200).json({
        status: "success",
        message: "Distance verified and punishment completed",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Distance not yet completed",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPunishmentStatus,
  completePunishment,
  verifyDistance,
};
