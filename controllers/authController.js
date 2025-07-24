export const signup = async (req, res, supabase) => {
  const { email, password, phone } = req.body;

  // 1. Sign up the user via Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { phone },
    },
  });

  if (signUpError) {
    return res.status(400).json({ error: signUpError.message });
  }

  const user = signUpData.user;

  // 2. Insert a player record in the "players" table
  const { error: playerError } = await supabase.from("players").insert([
    {
      id: user.id, // link player row to auth user ID
      username: email.split("@")[0], // default username from email
      health_points: 100,
      max_health_points: 100,
      overall_level: 1,
      total_xp: 0,
      difficulty: "easy",
      gems: 0,
      currency: 0,
      profile_image_url: "https://example.com/default-avatar.png",
    },
  ]);

  if (playerError) {
    return res.status(500).json({
      error:
        "Signup succeeded, but player creation failed: " + playerError.message,
    });
  }

  // 3. Return the user info
  res.status(201).json({ user });
};

export const signin = async (req, res, supabase) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  const user = {
    id: data.user.id,
    email: data.user.email,
  };

  const session = {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  };

  res.json({ user, session });
};

export const refresh = async (req, res, supabase) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error) return res.status(400).json({ error: error.message });

  const session = {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
  };

  res.json({ session });
};
