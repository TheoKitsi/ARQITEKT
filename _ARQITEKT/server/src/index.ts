import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimit, aiRateLimit } from './middleware/rateLimit.js';
import { requireAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { projectsRouter } from './routes/projects.js';
import { requirementsRouter } from './routes/requirements.js';
import { deployRouter } from './routes/deploy.js';
import { chatRouter } from './routes/chat.js';
import { githubRouter } from './routes/github.js';
import { feedbackRouter } from './routes/feedback.js';
import { filesRouter } from './routes/files.js';
import { hubRouter } from './routes/hub.js';
import { conversationsRouter } from './routes/conversations.js';
import { pipelineRouter } from './routes/pipeline.js';
import { probingRouter } from './routes/probing.js';
import { baselineRouter } from './routes/baseline.js';
import { notificationsRouter } from './routes/notifications.js';
import { setupWebSocket, destroyAllTerminals } from './websocket/index.js';
import { registerBroadcast } from './services/notifications.js';
import { stopAllApps } from './services/appManager.js';

// Safety check: fail fast if auth is enabled but JWT secret is the default
if (config.authEnabled && config.jwtSecret === 'arqitekt-local-dev-secret-not-for-production') {
  console.error('FATAL: AUTH_ENABLED=true but JWT_SECRET is the default. Set a secure JWT_SECRET in .env');
  process.exit(1);
}

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://avatars.githubusercontent.com"],
      connectSrc: ["'self'", "ws:", "wss:", "https://api.github.com", "https://models.inference.ai.azure.com"],
    },
  },
}));
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: config.bodyLimit }));
app.use(cookieParser());

// Rate limiting
app.use('/api', apiRateLimit);
app.use('/api/chat', aiRateLimit);

// Auth routes (public — no requireAuth)
app.use('/api/auth', authRouter);

// Auth middleware — applied to all /api/* routes AFTER auth routes
// When AUTH_ENABLED=false (default), this is a no-op passthrough
app.use('/api', requireAuth);

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/projects', requirementsRouter);
app.use('/api/projects', deployRouter);
app.use('/api/projects', feedbackRouter);
app.use('/api/projects', filesRouter);
app.use('/api/projects', conversationsRouter);
app.use('/api/projects', pipelineRouter);
app.use('/api/projects', probingRouter);
app.use('/api/projects', baselineRouter);
app.use('/api/projects', notificationsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/github', githubRouter);
app.use('/api/hub', hubRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0', authEnabled: config.authEnabled });
});

// Error handler (must be last)
app.use(errorHandler);

// WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });
setupWebSocket(wss);

// Register notification broadcast so services can push to all WS clients
registerBroadcast((type, payload) => {
  const msg = JSON.stringify({ type, payload });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
});

// Start server
server.listen(config.port, () => {
  console.log(`ARQITEKT Server running on http://localhost:${config.port}`);
  console.log(`WebSocket available on ws://localhost:${config.port}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  destroyAllTerminals();
  stopAllApps();
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
