import { Router } from 'express';
import { MobileGameController } from '../controllers/mobileGameController';

const router = Router();

// Rotas para jogos
router.get('/search', MobileGameController.searchGames);
router.get('/details/:packageName', MobileGameController.getGameDetails);

export default router;
