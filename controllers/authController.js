export const signup = async (req, res, supabase) => {
  const { email, password, phone } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { phone },
    },
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
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
