import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimit, aiRateLimit } from './middleware/rateLimit.js';
import { projectsRouter } from './routes/projects.js';
import { requirementsRouter } from './routes/requirements.js';
import { deployRouter } from './routes/deploy.js';
import { chatRouter } from './routes/chat.js';
import { githubRouter } from './routes/github.js';
import { feedbackRouter } from './routes/feedback.js';
import { filesRouter } from './routes/files.js';
import { hubRouter } from './routes/hub.js';
import { conversationsRouter } from './routes/conversations.js';
import { setupWebSocket, destroyAllTerminals } from './websocket/index.js';
import { stopAllApps } from './services/appManager.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: config.bodyLimit }));

// Rate limiting
app.use('/api', apiRateLimit);
app.use('/api/chat', aiRateLimit);

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/projects', requirementsRouter);
app.use('/api/projects', deployRouter);
app.use('/api/projects', feedbackRouter);
app.use('/api/projects', filesRouter);
app.use('/api/projects', conversationsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/github', githubRouter);
app.use('/api/hub', hubRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

// Error handler (must be last)
app.use(errorHandler);

// WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });
setupWebSocket(wss);

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
