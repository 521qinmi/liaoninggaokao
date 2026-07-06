import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import homeRoutes from './routes/home';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(corsMiddleware);

app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
