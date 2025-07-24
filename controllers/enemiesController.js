import { supabase } from "../supabaseClient.js";

export async function getEnemies(req, res) {
  try {
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("enemies")
      .select("*")
      .eq("player_id", playerId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getEnemyById(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("enemies")
      .select("*")
      .eq("id", id)
      .eq("player_id", playerId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Enemy not found" });
  }
}

export async function createEnemy(req, res) {
  try {
    const playerId = req.user.id;
    const { name, health, damage, icon } = req.body;

    const { data, error } = await supabase
      .from("enemies")
      .insert([{ player_id: playerId, name, health, damage, icon }])
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateEnemy(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from("enemies")
      .update(updates)
      .eq("id", id)
      .eq("player_id", playerId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteEnemy(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { error } = await supabase
      .from("enemies")
      .delete()
      .eq("id", id)
      .eq("player_id", playerId);

    if (error) throw error;

    res.json({ message: "Enemy deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
