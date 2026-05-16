import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get('/', (req, res) => {
  res.json({
    status: "AI Layout Agent Running",
    endpoints: ["/api/chat"],
  });
});

app.use('/api/chat', chatRoutes);

export default app;
