const { supabaseAdmin } = require("../config/supabase.js"); // your initialized supabase client
const { AppError } = require("../middleware/errorHandler");

const register = async (req, res, next) => {
  try {
    const { email, password, username, title } = req.body;

    // console.log("Registering user:", { email, username, title });

    // 1. Sign up user with Supabase Auth
    const { data: signUpData, error: signUpError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: { username, title }, // optional metadata on auth user, if needed
        },
      });

    if (signUpError) {
      throw new AppError(signUpError.message, 400);
    }

    const user = signUpData.user;

    // 2. Insert additional user info into your 'users' table
    const { error: userInsertError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          id: user.id,
          email,
          username: username || email.split("@")[0],
          title: title || null,
          created_at: new Date().toISOString(),
        },
      ]);

    if (userInsertError) {
      // Optionally delete auth user to rollback if metadata insert fails (not shown here)
      throw new AppError(
        "User registered but failed to save profile info: " +
          userInsertError.message,
        500
      );
    }

    // 3. Generate token here if you want, or return user info for client to log in manually
    // Supabase Auth session/token management can also be handled on frontend

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email,
          username: username || email.split("@")[0],
          title: title || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError("Invalid email or password", 401);
    }

    const user = data.user;

    // Fetch additional user info from your 'users' table
    const { data: userMetadata, error: metaError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (metaError) {
      console.warn("Could not fetch user metadata:", metaError.message);
    }

    // Return user info + session tokens
    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          ...(userMetadata || {}),
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError("Refresh token required", 401);
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: token,
    });

    if (error) {
      throw new AppError("Invalid or expired token", 403);
    }

    res.status(200).json({
      status: "success",
      data: {
        token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
};
