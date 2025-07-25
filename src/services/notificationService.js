const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const { createUserClient } = require("../config/supabase");
const admin = require("firebase-admin");

const scheduleTaskReminder = async (task) => {
  const { data: notification, error } = await supabaseAdmin
    .from("notifications")
    .insert([
      {
        user_id: task.user_id,
        type: "task_reminder",
        title: `Reminder: ${task.name}`,
        message: `Don't forget to complete your task: ${task.name}`,
        data: { task_id: task.id },
        scheduled_for: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      },
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return notification;
};

const sendPushNotification = async (userId, notification) => {
  const userClient = createUserClient(userId);
  const { data: user, error: userError } = await userClient
    .from("users")
    .select("fcm_token")
    .eq("id", userId)
    .single();

  if (userError) {
    throw new AppError(userError.message, 400);
  }

  if (user.fcm_token) {
    const message = {
      notification: {
        title: notification.title,
        body: notification.message,
      },
      token: user.fcm_token,
    };

    try {
      await admin.messaging().send(message);
      return { success: true };
    } catch (error) {
      throw new AppError(error.message, 400);
    }
  }

  return { success: false, message: "No FCM token found for user" };
};

const createSystemNotification = async (userId, type, data) => {
  const { data: notification, error } = await supabaseAdmin
    .from("notifications")
    .insert([
      {
        user_id: userId,
        type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        scheduled_for: data.scheduled_for || new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return notification;
};

const processScheduledNotifications = async () => {
  const now = new Date().toISOString();
  const { data: notifications, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .lte("scheduled_for", now)
    .eq("is_read", false);

  if (error) {
    throw new AppError(error.message, 400);
  }

  const results = [];
  for (const notification of notifications) {
    const result = await sendPushNotification(
      notification.user_id,
      notification
    );
    results.push(result);

    if (result.success) {
      await supabaseAdmin
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);
    }
  }

  return results;
};

module.exports = {
  scheduleTaskReminder,
  sendPushNotification,
  createSystemNotification,
  processScheduledNotifications,
};
