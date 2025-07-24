import { supabase } from "../supabaseClient.js";

export async function getCompletions(req, res) {
  try {
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("completions")
      .select("*, task:tasks(*)")
      .eq("player_id", playerId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCompletionById(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("completions")
      .select("*")
      .eq("id", id)
      .eq("player_id", playerId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Completion not found" });
  }
}

export async function createCompletion(req, res) {
  try {
    const playerId = req.user.id;
    const { task_id, completed_at } = req.body;

    // Validate task ownership through player's skills
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("skill_id")
      .eq("id", task_id)
      .single();

    if (taskError || !taskData)
      return res.status(404).json({ error: "Task not found" });

    // Confirm the skill belongs to the player
    const { data: skillData, error: skillError } = await supabase
      .from("skills")
      .select("id")
      .eq("id", taskData.skill_id)
      .eq("player_id", playerId)
      .single();

    if (skillError || !skillData)
      return res
        .status(403)
        .json({ error: "Forbidden: task not owned by player" });

    const { data, error } = await supabase
      .from("completions")
      .insert([
        {
          player_id: playerId,
          task_id,
          completed_at: completed_at || new Date().toISOString(),
        },
      ])
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteCompletion(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { error } = await supabase
      .from("completions")
      .delete()
      .eq("id", id)
      .eq("player_id", playerId);

    if (error) throw error;

    res.json({ message: "Completion deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
