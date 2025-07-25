// src/controllers/media.js
import { supabase } from "../supabaseClient.js";

async function uploadMedia(req, res) {
  const file = req.file;
  const path = `${req.user.id}/${Date.now()}-${file.originalname}`;
  const bucket = "user-media";

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      metadata: {
        user_id: req.user.id,
      },
      upsert: false,
    });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ path: data.path });
}
async function getMediaUrl(req, res) {
  const { path } = req.query;

  const { data, error } = await supabase.storage
    .from("user-media")
    .createSignedUrl(path, 60 * 60); // 1 hour

  if (error) return res.status(400).json({ error: error.message });
  res.json({ url: data.signedUrl });
}
