const redis = require("redis");
const { REDIS_URL } = require("./environment");

const client = redis.createClient({
  url: REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

// Connect to Redis
(async () => {
  await client.connect();
})();

module.exports = client;
