const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("./errorHandler");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Access token required", 401);
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    // console.log("data received:", data);
    if (error || !data?.user) {
      throw new AppError("Invalid or expired token", 401);
    }

    req.user = data.user;
    req.userId = data.user.id;
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", decoded.userId)
        .single();

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
