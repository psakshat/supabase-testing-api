import { supabase } from "./supabaseClient.js";

export async function getPlayerProfile(req, res) {
  try {
    const playerId = req.user?.id;
    console.log("Fetching profile for playerId:", playerId);

    if (!playerId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!data) {
      console.log("No player found with id:", playerId);
      return res.status(404).json({ error: "Player not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePlayerProfile(req, res) {
  try {
    const playerId = req.user?.id;
    console.log("Updating profile for playerId:", playerId);

    if (!playerId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

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
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!data) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
