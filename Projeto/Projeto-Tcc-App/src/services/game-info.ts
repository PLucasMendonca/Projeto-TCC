import axios from 'axios';

interface GameRequirements {
  minimum: {
    os: string;
    processor: string;
    memory: number; // em MB
    graphics: string;
    storage: number; // em MB
  };
  recommended: {
    os: string;
    processor: string;
    memory: number; // em MB
    graphics: string;
    storage: number; // em MB
  };
}

interface GameDetails {
  id: string;
  title: string;
  requirements: GameRequirements;
  genre: string[];
  releaseDate: string;
  developer: string;
  size: number; // em bytes
  version: string;
}

export class GameInfoService {
  private static readonly IGDB_API_URL = 'https://api.igdb.com/v4';
  private static readonly CLIENT_ID = 'YOUR_CLIENT_ID';
  private static readonly ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

  static async getGameInfo(packageName: string): Promise<GameDetails | null> {
    try {
      // Primeiro busca o jogo pelo nome do pacote
      const searchResponse = await axios.post(
        `${this.IGDB_API_URL}/games`,
        `search "${packageName}"; fields name,genres.name,release_dates.date,involved_companies.company.name;`,
        {
          headers: {
            'Client-ID': this.CLIENT_ID,
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          },
        }
      );

      if (!searchResponse.data || searchResponse.data.length === 0) {
        return null;
      }

      const game = searchResponse.data[0];

      // Depois busca os requisitos do jogo
      const requirementsResponse = await axios.post(
        `${this.IGDB_API_URL}/games`,
        `where id = ${game.id}; fields platforms.platform_version_release_dates.platform_version.name;`,
        {
          headers: {
            'Client-ID': this.CLIENT_ID,
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          },
        }
      );

      // Mapeia os dados para nosso formato
      return {
        id: game.id,
        title: game.name,
        requirements: {
          minimum: {
            os: 'Android',
            processor: '1.5 GHz',
            memory: 2048, // 2GB
            graphics: 'OpenGL ES 3.0',
            storage: game.size || 1024 // 1GB se não especificado
          },
          recommended: {
            os: 'Android',
            processor: '2.0 GHz',
            memory: 4096, // 4GB
            graphics: 'OpenGL ES 3.1',
            storage: (game.size || 1024) * 1.5
          }
        },
        genre: game.genres?.map((g: any) => g.name) || [],
        releaseDate: game.release_dates?.[0]?.date || '',
        developer: game.involved_companies?.[0]?.company?.name || '',
        size: game.size || 0,
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Erro ao buscar informações do jogo:', error);
      return null;
    }
  }

  // Função para buscar informações alternativas do APK
  static async getApkInfo(packageName: string): Promise<Partial<GameDetails>> {
    try {
      // Aqui podemos implementar uma chamada para a AppBrain API
      // ou usar web scraping em sites como APKPure, APKMirror
      const response = await axios.get(`https://api.appbrain.com/v2/info/${packageName}`);
      
      return {
        size: response.data.size,
        version: response.data.version,
        requirements: {
          minimum: {
            os: response.data.minAndroidVersion || 'Android 5.0',
            processor: response.data.cpuArch || 'arm64-v8a',
            memory: response.data.minRam || 2048,
            graphics: 'OpenGL ES 2.0',
            storage: response.data.size || 1024
          },
          recommended: {
            os: response.data.targetAndroidVersion || 'Android 8.0',
            processor: response.data.cpuArch || 'arm64-v8a',
            memory: (response.data.minRam || 2048) * 2,
            graphics: 'OpenGL ES 3.0',
            storage: (response.data.size || 1024) * 1.5
          }
        }
      };
    } catch (error) {
      console.error('Erro ao buscar informações do APK:', error);
      return {};
    }
  }

  // Função para combinar dados de múltiplas fontes
  static async getCompleteGameInfo(packageName: string): Promise<GameDetails | null> {
    try {
      // Tenta primeiro a IGDB
      const igdbInfo = await this.getGameInfo(packageName);
      
      // Busca informações complementares do APK
      const apkInfo = await this.getApkInfo(packageName);

      // Combina as informações
      return {
        ...igdbInfo,
        ...apkInfo,
        requirements: {
          minimum: {
            ...igdbInfo?.requirements.minimum,
            ...apkInfo?.requirements?.minimum
          },
          recommended: {
            ...igdbInfo?.requirements.recommended,
            ...apkInfo?.requirements?.recommended
          }
        }
      } as GameDetails;
    } catch (error) {
      console.error('Erro ao buscar informações completas:', error);
      return null;
    }
  }
}
