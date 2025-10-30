import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import recordRoutes from './routes/records.js';
import adminRoutes from './routes/admin.js';
import kioskRoutes from './routes/kiosk.js';
import scheduleRoutes from './routes/schedules.js';
import vacationRoutes from './routes/vacations.js';
import aiRoutes from './routes/ai.js';

export function createApp(env = {}) {
  const app = express();

  // Configurar variables de entorno desde Cloudflare
  const config = {
    DATABASE_URL: env.DATABASE_URL || process.env.DATABASE_URL,
    JWT_SECRET: env.JWT_SECRET || process.env.JWT_SECRET,
    OPENAI_API_KEY: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    NODE_ENV: env.NODE_ENV || process.env.NODE_ENV || 'production'
  };

  // Rate limiting (más permisivo para Cloudflare)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Middleware básico
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }));
  app.use(limiter);

  // CORS configuration - Más permisivo para Cloudflare
  const corsOptions = {
    origin: [
      /^https:\/\/.*\.pages\.dev$/, // Cloudflare Pages
      /^https:\/\/.*\.workers\.dev$/, // Cloudflare Workers
      /^https:\/\/.*\.vercel\.app$/, // Vercel
      /^https:\/\/.*\.netlify\.app$/, // Netlify
      /^https:\/\/localhost:\d+$/, // Local development
      'http://localhost:5173',
      'http://localhost:3000',
      true // Allow same origin
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health checks
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      platform: 'Cloudflare Workers'
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      platform: 'Cloudflare Workers',
      database: config.DATABASE_URL ? 'configured' : 'missing'
    });
  });

  // Debug endpoint
  app.get('/api/debug', (req, res) => {
    res.json({
      status: 'DEBUG',
      platform: 'Cloudflare Workers',
      environment: config.NODE_ENV,
      database_url: config.DATABASE_URL ? 'configured' : 'missing',
      jwt_secret: config.JWT_SECRET ? 'configured' : 'missing',
      openai_key: config.OPENAI_API_KEY ? 'configured' : 'missing',
      timestamp: new Date().toISOString(),
      headers: req.headers,
      url: req.url
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/records', recordRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/kiosk', kioskRoutes);
  app.use('/api/schedules', scheduleRoutes);
  app.use('/api/vacations', vacationRoutes);
  app.use('/api/ai', aiRoutes);

  // Error handling middleware
  app.use(errorHandler);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl,
      platform: 'Cloudflare Workers'
    });
  });

  return app;
}

// Para desarrollo local (mantener compatibilidad)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const app = createApp();
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });
}
