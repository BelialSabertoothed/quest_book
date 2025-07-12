import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profile';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', profileRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});