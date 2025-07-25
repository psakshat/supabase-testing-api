const winston = require("winston");
const { v4: uuidv4 } = require("uuid");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: "logs/combined.log" })],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const requestLogger = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.requestId = requestId;

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      message: "HTTP request",
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  });

  next();
};

module.exports = requestLogger;
