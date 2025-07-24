import { supabase } from "../supabaseClient.js";

export async function getSkills(req, res) {
  try {
    const playerId = req.user.id;
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("player_id", playerId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSkillById(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("id", id)
      .eq("player_id", playerId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Skill not found" });
  }
}

export async function createSkill(req, res) {
  try {
    const playerId = req.user.id;
    const { name, description, difficulty_override, icon } = req.body;

    const { data, error } = await supabase
      .from("skills")
      .insert([
        { player_id: playerId, name, description, difficulty_override, icon },
      ])
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateSkill(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from("skills")
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

export async function deleteSkill(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id)
      .eq("player_id", playerId);

    if (error) throw error;

    res.json({ message: "Skill deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
