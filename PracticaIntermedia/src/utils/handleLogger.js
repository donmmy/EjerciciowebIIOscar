import { IncomingWebhook } from '@slack/webhook';
import { WebClient } from '@slack/web-api';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Crear directorio de logs si no existe
const logDir = process.env.LOG_DIR || './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Webhook para mensajes simples
const webhook = process.env.SLACK_WEBHOOK_URL
  ? new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)
  : null;

// Cliente para mensajes ricos
const slackClient = process.env.SLACK_BOT_TOKEN 
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

// Logger con Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

export const loggerStream = {
  write: (message) => {
    if (webhook) {
      webhook.send({
        text: `🚨 *Error en API*\n\`\`\`${message}\`\`\``
      }).catch(err => console.error('Error enviando a Slack:', err));
    }
    logger.error(message);
  }
};

/**
 * Enviar notificación simple a Slack
 */
export const sendSlackNotification = async (text) => {
  if (webhook) {
    try {
      await webhook.send({ text });
      console.log('✅ Notificación enviada a Slack');
    } catch (err) {
      console.error('❌ Error enviando a Slack:', err);
    }
  }
};

/**
 * Logger de usuario registrado
 */
export const logUserRegistered = async (user) => {
  const message = `🎉 Nuevo usuario registrado: ${user.name} (${user.email})`;
  logger.info(message);
  await sendSlackNotification(message);
};

/**
 * Logger de albarán firmado
 */
export const logDeliveryNoteSigned = async (deliveryNote, signedBy) => {
  const message = `📄 Albarán #${deliveryNote._id} firmado por ${signedBy}`;
  logger.info(message);
  await sendSlackNotification(message);
};

/**
 * Logger de proyecto completado
 */
export const logProjectCompleted = async (project) => {
  const message = `✅ Proyecto "${project.name}" completado`;
  logger.info(message);
  await sendSlackNotification(message);
};

/**
 * Logger de error crítico
 */
export const logCriticalError = async (error, context = {}) => {
  const message = `🚨 Error crítico: ${error.message}`;
  logger.error(message, { stack: error.stack, context });
  await sendSlackNotification(`🚨 Error: ${error.message}`);
};

/**
 * Logger de rate limit excedido
 */
export const logRateLimitExceeded = async (ip, endpoint) => {
  const message = `⚠️ Rate limit excedido desde ${ip} en ${endpoint}`;
  logger.warn(message);
  await sendSlackNotification(message);
};

/**
 * Logger de cliente creado
 */
export const logClientCreated = async (client) => {
  const message = `👤 Nuevo cliente: ${client.name} (${client.cif})`;
  logger.info(message);
  await sendSlackNotification(message);
};

/**
 * Logger de proyecto creado
 */
export const logProjectCreated = async (project) => {
  const message = `📋 Nuevo proyecto: "${project.name}" ($${project.budget})`;
  logger.info(message);
  await sendSlackNotification(message);
};

export default logger;
