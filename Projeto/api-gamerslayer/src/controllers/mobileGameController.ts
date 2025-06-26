import { Request, Response } from 'express';
import { PuppeteerPlayStoreService } from '../services/puppeteerPlayStoreService';

export class MobileGameController {
  // Buscar jogos por termo de pesquisa
  static async searchGames(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.query as string;

      if (!query) {
        res.status(400).json({
          success: false,
          error: "O parâmetro 'query' é obrigatório"
        });
        return;
      }

      const games = await PuppeteerPlayStoreService.searchGames(query);

      res.json({
        success: true,
        query,
        results: games
      });
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      res.status(500).json({
        success: false,
        error: `Erro ao buscar jogos: ${error.message}`
      });
    }
  }

  // Obter detalhes de um jogo específico
  static async getGameDetails(req: Request, res: Response): Promise<void> {
    try {
      const { packageName } = req.params;

      if (!packageName) {
        res.status(400).json({
          success: false,
          error: "Package name não fornecido"
        });
        return;
      }

      const game = await PuppeteerPlayStoreService.getGameDetails(packageName);

      res.json({
        success: true,
        data: game
      });
    } catch (error) {
      console.error('Erro ao obter detalhes do jogo:', error);
      res.status(500).json({
        success: false,
        error: `Erro ao obter detalhes do jogo: ${error.message}`
      });
    }
  }
}
