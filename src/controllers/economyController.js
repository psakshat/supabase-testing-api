const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getBalance = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("in_app_currency, gems")
      .eq("id", userId)
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        balance: {
          currency: user.in_app_currency,
          gems: user.gems,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const purchaseGems = async (req, res, next) => {
  try {
    const { userId } = req;
    const { gemPackage } = req.body;

    // Define gem packages
    const packages = {
      small: { gems: 50, price: 499 }, // $4.99
      medium: { gems: 120, price: 999 }, // $9.99
      large: { gems: 250, price: 1999 }, // $19.99
    };

    const selectedPackage = packages[gemPackage];

    if (!selectedPackage) {
      throw new AppError("Invalid gem package", 400);
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedPackage.price,
      currency: "usd",
      metadata: {
        userId,
        gemPackage,
        gems: selectedPackage.gems,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const { userId } = req;

    const { data: transactions, error } = await supabaseAdmin
      .from("payment_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      status: "success",
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalance,
  purchaseGems,
  getTransactions,
};
