import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();

  // Cross-Origin Resource Sharing
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health Check Endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'KitFlow Embedded Backend',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API and Auth Routes
  app.use(apiRouter);

  // Serve Frontend Production Assets if built
  const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
