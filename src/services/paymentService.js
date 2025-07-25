const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

const createPaymentIntent = async (userId, amount, gemPackage) => {
  const packages = {
    small: { gems: 50, price: 499 },
    medium: { gems: 120, price: 999 },
    large: { gems: 250, price: 1999 },
  };

  const selectedPackage = packages[gemPackage];

  if (!selectedPackage) {
    throw new AppError("Invalid gem package", 400);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: selectedPackage.price,
    currency: "usd",
    metadata: {
      userId,
      gemPackage,
      gems: selectedPackage.gems,
    },
  });

  return paymentIntent;
};

const processWebhook = async (stripeEvent) => {
  const event = stripeEvent;

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;
      const gems = paymentIntent.metadata.gems;

      await supabaseAdmin
        .from("users")
        .update({
          gems: supabaseAdmin.rpc("increment_user_gems", {
            user_id: userId,
            amount: gems,
          }),
        })
        .eq("id", userId);

      await supabaseAdmin.from("payment_transactions").insert([
        {
          user_id: userId,
          transaction_type: "gem_purchase",
          amount_usd: paymentIntent.amount / 100,
          gems_purchased: gems,
          stripe_payment_intent_id: paymentIntent.id,
          status: "completed",
        },
      ]);

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { success: true };
};

const grantPurchasedGems = async (userId, gemAmount) => {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .update({
      gems: supabaseAdmin.rpc("increment_user_gems", {
        user_id: userId,
        amount: gemAmount,
      }),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return user;
};

const validatePurchase = async (transactionId) => {
  const { data: transaction, error } = await supabaseAdmin
    .from("payment_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  if (transaction.status !== "completed") {
    throw new AppError("Transaction not completed", 400);
  }

  return transaction;
};

module.exports = {
  createPaymentIntent,
  processWebhook,
  grantPurchasedGems,
  validatePurchase,
};
