import { supabase } from "../supabaseClient.js";

export async function getTasks(req, res) {
  try {
    const playerId = req.user.id;

    // Fetch tasks via join to skills, only player's skills
    const { data, error } = await supabase
      .from("tasks")
      .select("*, skill:skills(*)")
      .in(
        "skill_id",
        supabase.from("skills").select("id").eq("player_id", playerId)
      );

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .in(
        "skill_id",
        supabase.from("skills").select("id").eq("player_id", playerId)
      )
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Task not found" });
  }
}

export async function createTask(req, res) {
  try {
    const playerId = req.user.id;
    const {
      skill_id,
      name,
      description,
      xp_reward,
      frequency,
      reminder_times,
      punishment_enabled,
      icon,
    } = req.body;

    // Validate skill ownership
    const { data: skillData, error: skillError } = await supabase
      .from("skills")
      .select("id")
      .eq("id", skill_id)
      .eq("player_id", playerId)
      .single();

    if (skillError || !skillData)
      return res
        .status(403)
        .json({ error: "Invalid skill or not owned by user" });

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          skill_id,
          name,
          description,
          xp_reward,
          frequency,
          reminder_times,
          punishment_enabled,
          icon,
        },
      ])
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;
    const updates = req.body;

    // Validate ownership through skill
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("skill_id")
      .eq("id", id)
      .single();

    if (taskError || !taskData)
      return res.status(404).json({ error: "Task not found" });

    const { data: skillData, error: skillError } = await supabase
      .from("skills")
      .select("id")
      .eq("id", taskData.skill_id)
      .eq("player_id", playerId)
      .single();

    if (skillError || !skillData)
      return res.status(403).json({ error: "Forbidden" });

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    // Validate ownership through skill
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("skill_id")
      .eq("id", id)
      .single();

    if (taskError || !taskData)
      return res.status(404).json({ error: "Task not found" });

    const { data: skillData, error: skillError } = await supabase
      .from("skills")
      .select("id")
      .eq("id", taskData.skill_id)
      .eq("player_id", playerId)
      .single();

    if (skillError || !skillData)
      return res.status(403).json({ error: "Forbidden" });

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
