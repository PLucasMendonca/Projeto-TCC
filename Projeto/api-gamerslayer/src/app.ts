import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota base
app.get('/', (req, res) => {
  res.json({ message: 'API GamerSlayer Mobile está funcionando!' });
});

// Rotas da API
app.use('/api/games', gameRoutes);

export default app;
