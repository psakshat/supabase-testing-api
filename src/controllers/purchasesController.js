import { supabase } from "../supabaseClient.js";

export async function getPurchases(req, res) {
  try {
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("purchases")
      .select("*, item:items(*)") // assuming purchases linked to items table
      .eq("player_id", playerId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPurchaseById(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("id", id)
      .eq("player_id", playerId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Purchase not found" });
  }
}

export async function createPurchase(req, res) {
  try {
    const playerId = req.user.id;
    const { item_id, quantity } = req.body;

    // You might want to add logic checking if player has enough currency, etc.

    const { data, error } = await supabase
      .from("purchases")
      .insert([
        {
          player_id: playerId,
          item_id,
          quantity: quantity || 1,
          purchased_at: new Date().toISOString(),
        },
      ])
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deletePurchase(req, res) {
  try {
    const { id } = req.params;
    const playerId = req.user.id;

    const { error } = await supabase
      .from("purchases")
      .delete()
      .eq("id", id)
      .eq("player_id", playerId);

    if (error) throw error;

    res.json({ message: "Purchase deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
