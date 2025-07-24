import { supabase } from "../supabaseClient.js";

// Get current player's profile
export async function getPlayerProfile(req, res) {
  try {
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ error: "Player not found" });
  }
}

// Update current player's profile
export async function updatePlayerProfile(req, res) {
  try {
    const playerId = req.user.id;
    const updates = req.body;

    const allowedFields = [
      "username",
      "title",
      "health_points",
      "max_health_points",
      "overall_level",
      "total_xp",
      "difficulty",
      "gems",
      "currency",
      "profile_image_url",
    ];

    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const { data, error } = await supabase
      .from("players")
      .update(filteredUpdates)
      .eq("id", playerId)
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message || "Update failed" });
  }
}
