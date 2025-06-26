import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log('Endpoints disponíveis:');
  console.log('- GET /api/games/search?query=NOME_DO_JOGO');
  console.log('- GET /api/games/details/PACKAGE_NAME');
});
