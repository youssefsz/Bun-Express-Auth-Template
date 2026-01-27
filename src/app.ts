import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Versioning
app.use('/api/v1/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
