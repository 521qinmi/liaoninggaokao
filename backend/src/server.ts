import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import homeRoutes from './routes/home';
import authRoutes from './routes/auth';
import verificationRoutes from './routes/verification';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(corsMiddleware);

app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);

const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({ status: 'Backend server is running' });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
