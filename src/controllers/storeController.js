// const { supabaseAdmin } = require("../config/supabase");
// const { AppError } = require("../middleware/errorHandler");
// const { v4: uuidv4 } = require("uuid");
// // Create or Update Store Item
// const createStoreItem = async (req, res, next) => {
//   try {
//     const {
//       name,
//       info,
//       potency,
//       effect,
//       reward,
//       restriction,
//       currency_cost,
//       gem_cost,
//       icon_url,
//       is_active = true,
//     } = req.body;

//     const { data, error } = await supabaseAdmin
//       .from("store_items")
//       .insert([
//         {
//           name,
//           info,
//           potency,
//           effect,
//           reward,
//           restriction,
//           currency_cost,
//           gem_cost,
//           icon_url,
//           is_active,
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw new AppError(error.message, 400);

//     res.status(201).json({ status: "success", data });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get All Active Store Items
// const getAllStoreItems = async (req, res, next) => {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from("store_items")
//       .select("*")
//       .eq("is_active", true);

//     if (error) throw new AppError(error.message, 400);

//     res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Buy Store Item
// const buyStoreItem = async (req, res, next) => {
//   try {
//     const { userId } = req;
//     const { storeItemId, quantity = 1 } = req.body;

//     if (!storeItemId || quantity < 1) {
//       throw new AppError("Invalid store item or quantity", 400);
//     }

//     // Get store item
//     const { data: item, error: itemError } = await supabaseAdmin
//       .from("store_items")
//       .select("*")
//       .eq("id", storeItemId)
//       .eq("is_active", true)
//       .single();

//     if (itemError || !item) throw new AppError("Store item not found", 404);

//     const totalCurrencyCost = (item.currency_cost || 0) * quantity;
//     const totalGemCost = (item.gem_cost || 0) * quantity;

//     // Get user
//     const { data: user, error: userError } = await supabaseAdmin
//       .from("users")
//       .select("id, in_app_currency, gems, current_hp, max_hp")
//       .eq("id", userId)
//       .single();

//     if (userError || !user) throw new AppError("User not found", 404);

//     // Check balance
//     if (
//       (totalCurrencyCost > 0 && user.in_app_currency < totalCurrencyCost) ||
//       (totalGemCost > 0 && user.gems < totalGemCost)
//     ) {
//       throw new AppError("Insufficient funds", 400);
//     }

//     // Restriction check (per_day)
//     if (item.restriction?.limit && item.restriction?.unit === "per_day") {
//       const startOfDay = new Date();
//       startOfDay.setHours(0, 0, 0, 0);

//       const { count, error: usageError } = await supabaseAdmin
//         .from("power_up_purchases")
//         .select("id", { count: "exact", head: true })
//         .eq("user_id", userId)
//         .eq("store_item_id", storeItemId)
//         .gte("purchased_at", startOfDay.toISOString());

//       if (usageError) throw new AppError("Error checking usage", 500);
//       if (count + quantity > item.restriction.limit) {
//         throw new AppError("Daily usage limit exceeded", 403);
//       }
//     }

//     // Apply item effect (currently supports health)
//     let newHP = user.current_hp;
//     if (item.effect?.type === "health" && item.effect.amount) {
//       const totalHeal = item.effect.amount * quantity;
//       newHP = Math.min(user.max_hp, user.current_hp + totalHeal);
//     }

//     // Update user balances & HP
//     const { error: updateUserError } = await supabaseAdmin
//       .from("users")
//       .update({
//         in_app_currency: user.in_app_currency - totalCurrencyCost,
//         gems: user.gems - totalGemCost,
//         current_hp: newHP,
//       })
//       .eq("id", userId);

//     if (updateUserError) throw new AppError("Failed to apply item", 500);

//     // Log purchase with UUID for id
//     const { error: logError } = await supabaseAdmin
//       .from("power_up_purchases")
//       .insert({
//         id: uuidv4(),
//         user_id: userId,
//         store_item_id: storeItemId,
//         quantity,
//         total_cost_currency: totalCurrencyCost,
//         total_cost_gems: totalGemCost,
//         purchased_at: new Date(),
//       });

//     if (logError) {
//       console.error("Purchase logging failed:", logError);
//       throw new AppError(`Failed to log purchase: ${logError.message}`, 500);
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Item purchased",
//       data: {
//         remaining_currency: user.in_app_currency - totalCurrencyCost,
//         remaining_gems: user.gems - totalGemCost,
//         new_hp: newHP,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateStoreItem = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updateFields = {
//       ...req.body,
//       updated_at: new Date(),
//     };

//     const { data, error } = await supabaseAdmin
//       .from("store_items")
//       .update(updateFields)
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) throw new AppError(error.message, 400);
//     if (!data) throw new AppError("Store item not found", 404);

//     res.status(200).json({ status: "success", data });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createStoreItem,
//   getAllStoreItems,
//   buyStoreItem,
//   updateStoreItem,
// };
const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const { v4: uuidv4 } = require("uuid");

// Create Store Item
const createStoreItem = async (req, res, next) => {
  try {
    const {
      name,
      info,
      potency,
      effect,
      reward,
      restriction,
      currency_cost,
      gem_cost,
      icon_url,
      is_active = true,
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from("store_items")
      .insert([
        {
          name,
          info,
          potency,
          effect,
          reward,
          restriction,
          currency_cost,
          gem_cost,
          icon_url,
          is_active,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
};

// Get All Active Store Items
const getAllStoreItems = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("store_items")
      .select("*")
      .eq("is_active", true);

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Buy Store Item
const buyStoreItem = async (req, res, next) => {
  try {
    const { userId } = req;
    const { storeItemId, quantity = 1 } = req.body;

    if (!storeItemId || quantity < 1) {
      throw new AppError("Invalid store item or quantity", 400);
    }

    // Get store item
    const { data: item, error: itemError } = await supabaseAdmin
      .from("store_items")
      .select("*")
      .eq("id", storeItemId)
      .eq("is_active", true)
      .single();

    if (itemError || !item) throw new AppError("Store item not found", 404);

    const totalCurrencyCost = (item.currency_cost || 0) * quantity;
    const totalGemCost = (item.gem_cost || 0) * quantity;

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, in_app_currency, gems, current_hp, max_hp")
      .eq("id", userId)
      .single();

    if (userError || !user) throw new AppError("User not found", 404);

    if (user.in_app_currency < totalCurrencyCost || user.gems < totalGemCost) {
      throw new AppError("Insufficient funds", 400);
    }

    // Check restriction if any (e.g., daily limit)
    if (item.restriction?.daily_limit) {
      const since = new Date();
      since.setHours(0, 0, 0, 0);

      const { count: purchaseCount, error: countError } = await supabaseAdmin
        .from("power_up_purchases")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("store_item_id", storeItemId)
        .gte("purchased_at", since);

      if (countError) throw new AppError(countError.message, 400);

      if (purchaseCount + quantity > item.restriction.daily_limit) {
        throw new AppError(
          `Daily purchase limit exceeded. Limit: ${item.restriction.daily_limit}`,
          400
        );
      }
    }

    // Deduct currency and gems
    const updates = {
      in_app_currency: user.in_app_currency - totalCurrencyCost,
      gems: user.gems - totalGemCost,
    };

    // Apply effect: currently only "health_restore" supported
    if (item.effect === "health_restore" && item.potency) {
      updates.current_hp = Math.min(
        user.current_hp + item.potency * quantity,
        user.max_hp
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (updateError) throw new AppError(updateError.message, 400);

    // Log purchase
    const { error: purchaseError } = await supabaseAdmin
      .from("power_up_purchases")
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          store_item_id: storeItemId,
          quantity,
          total_cost_currency: totalCurrencyCost,
          total_cost_gems: totalGemCost,
          purchased_at: new Date(),
        },
      ]);

    if (purchaseError) throw new AppError(purchaseError.message, 400);

    res.status(200).json({
      status: "success",
      message: "Store item purchased successfully",
      data: {
        current_hp: updates.current_hp || user.current_hp - totalCurrencyCost,
        in_app_currency: updates.in_app_currency,
        gems: updates.gems,
      },
    });
  } catch (error) {
    next(error);
  }
};
const updateStoreItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = {
      ...req.body,
      updated_at: new Date(),
    };

    const { data, error } = await supabaseAdmin
      .from("store_items")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError("Store item not found", 404);

    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createStoreItem,
  getAllStoreItems,
  buyStoreItem,
  updateStoreItem,
};
