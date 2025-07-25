const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const getPowerUps = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: powerUps, error } = await supabaseAdmin
      .from("power_ups")
      .select("*")
      .or(`user_id.eq.${userId},is_system_item.eq.true`);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        powerUps,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createPowerUp = async (req, res, next) => {
  try {
    const { userId } = req;
    const powerUpData = req.body;

    const { data: powerUp, error } = await supabaseAdmin
      .from("power_ups")
      .insert([{ ...powerUpData, user_id: userId }])
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      status: "success",
      data: {
        powerUp,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updatePowerUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const updates = req.body;

    const { data: powerUp, error } = await supabaseAdmin
      .from("power_ups")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        powerUp,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deletePowerUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const { error } = await supabaseAdmin
      .from("power_ups")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const purchasePowerUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Fetch power-up details
    const { data: powerUp, error: fetchError } = await supabaseAdmin
      .from("power_ups")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new AppError(fetchError.message, 400);
    }

    // Check if user has enough currency or gems
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("in_app_currency, gems")
      .eq("id", userId)
      .single();

    if (userError) {
      throw new AppError(userError.message, 400);
    }

    if (
      user.in_app_currency < powerUp.cost_currency ||
      user.gems < powerUp.cost_gems
    ) {
      throw new AppError("Insufficient funds", 400);
    }

    // Deduct currency or gems
    const updates = {
      in_app_currency: user.in_app_currency - (powerUp.cost_currency || 0),
      gems: user.gems - (powerUp.cost_gems || 0),
    };

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (updateError) {
      throw new AppError(updateError.message, 400);
    }

    // Record purchase
    const { error: purchaseError } = await supabaseAdmin
      .from("power_up_purchases")
      .insert([
        {
          user_id: userId,
          power_up_id: id,
          quantity: 1,
          total_cost_currency: powerUp.cost_currency,
          total_cost_gems: powerUp.cost_gems,
        },
      ]);

    if (purchaseError) {
      throw new AppError(purchaseError.message, 400);
    }

    res.status(200).json({
      status: "success",
      message: "Power-up purchased successfully",
    });
  } catch (error) {
    next(error);
  }
};

const usePowerUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Fetch power-up details
    const { data: powerUp, error: fetchError } = await supabaseAdmin
      .from("power_ups")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new AppError(fetchError.message, 400);
    }

    // Apply power-up effect
    switch (powerUp.effect_type) {
      case "hp_restore":
        await supabaseAdmin.rpc("increment_user_hp", {
          user_id: userId,
          hp_amount: powerUp.effect_value,
        });
        break;
      case "xp_boost":
        // Apply XP boost logic
        break;
      case "extra_life":
        // Apply extra life logic
        break;
      default:
        throw new AppError("Invalid power-up effect type", 400);
    }

    res.status(200).json({
      status: "success",
      message: "Power-up used successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPowerUps,
  createPowerUp,
  updatePowerUp,
  deletePowerUp,
  purchasePowerUp,
  usePowerUp,
};
