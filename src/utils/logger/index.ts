import winston from "winston"

const customFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // winston.format.json(),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
})