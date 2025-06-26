import gplay, { IAppItem, IPermissionItem } from 'google-play-scraper';
import { MobileGame } from '../types/MobileGame';

export class PlayStoreService {
  static async searchGames(query: string): Promise<MobileGame[]> {
    try {
      const results = await gplay.search({
        term: query,
        num: 10,
        price: 'all',
        throttle: 10,
        category: gplay.category.GAME
      });

      return results.map(game => ({
        id: game.appId,
        title: game.title,
        packageName: game.appId,
        developer: game.developer,
        icon: game.icon,
        rating: game.score,
        reviews: (game as any).reviews || 0,
        size: String((game as any).size || 'Variável'),
        installs: String((game as any).installs || 'N/A'),
        price: game.priceText,
        androidVersion: String((game as any).androidVersion || 'Variável'),
        category: (game as any).genre || 'Jogo',
        contentRating: String((game as any).contentRating || 'N/A'),
        lastUpdated: String((game as any).updated || 'N/A'),
        requirements: {
          minAndroidVersion: String((game as any).androidVersion || 'N/A'),
          minRam: 'Variável',
          minStorage: String((game as any).size || 'Variável'),
          requiredPermissions: []
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      throw error;
    }
  }

  static async getGameDetails(packageName: string): Promise<MobileGame> {
    try {
      const [gameData, permissionsData] = await Promise.all([
        gplay.app({ appId: packageName }),
        gplay.permissions({ appId: packageName })
      ]);

      // Converter o array de permissões para array de strings
      const permissions = (permissionsData as IPermissionItem[]).map(p => p.permission);

      const game = gameData as any;

      return {
        id: game.appId,
        title: game.title,
        packageName: game.appId,
        developer: game.developer,
        icon: game.icon,
        rating: game.score,
        reviews: game.reviews || 0,
        size: String(game.size || 'Variável'),
        installs: String(game.installs || 'N/A'),
        price: game.priceText,
        androidVersion: String(game.androidVersion || 'Variável'),
        category: game.genre || 'Jogo',
        contentRating: String(game.contentRating || 'N/A'),
        lastUpdated: String(game.updated || 'N/A'),
        requirements: {
          minAndroidVersion: String(game.androidVersion || 'N/A'),
          minRam: 'Variável',
          minStorage: String(game.size || 'Variável'),
          requiredPermissions: permissions
        }
      };
    } catch (error) {
      console.error('Erro ao obter detalhes do jogo:', error);
      throw error;
    }
  }
}
