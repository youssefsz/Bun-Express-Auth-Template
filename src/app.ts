import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(hpp());

// API Versioning
app.use('/api/v1/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Bun Express Auth Template',
    creator: 'Youssef Dhibi'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler - Must be the last middleware
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The endpoint ${req.originalUrl} does not exist on this server.`,
    available_endpoints: {
      auth: '/api/v1/auth',
      health: '/health',
      root: '/'
    }
  });
});

export default app;
