import { chromium } from 'playwright';
import { MobileGame } from '../types/MobileGame';

export class PlayStoreScraperService {
  static async searchGames(query: string): Promise<MobileGame[]> {
    console.log('Iniciando busca por jogos com query:', query);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navegar para a página de busca da Play Store
      await page.goto(`https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps&c=GAME`);
      console.log('Página carregada');
      
      // Esperar pelos resultados
      await page.waitForSelector('div[role="listitem"]');
      console.log('Elementos encontrados');

      // Extrair informações dos jogos
      const games = await page.$$eval('div[role="listitem"]', (elements) => {
        console.log(`Encontrados ${elements.length} jogos`);
        return elements.slice(0, 10).map((el) => {
          const title = el.querySelector('h1, h2, h3')?.textContent?.trim() || '';
          const developer = el.querySelector('a[href*="developer"]')?.textContent?.trim() || '';
          const ratingEl = el.querySelector('[aria-label*="stars"]');
          const rating = ratingEl ? parseFloat(ratingEl.getAttribute('aria-label')?.match(/\d+(\.\d+)?/)?.[0] || '0') : 0;
          const icon = el.querySelector('img')?.getAttribute('src') || '';
          const linkEl = el.querySelector('a[href*="details"]') as HTMLAnchorElement;
          const packageName = linkEl?.href?.match(/details\?id=([^&]+)/)?.[1] || '';

          return {
            id: packageName,
            title,
            packageName,
            developer,
            icon,
            rating,
            reviews: 0,
            size: 'Variável',
            installs: 'N/A',
            price: 'Free',
            androidVersion: 'Variável',
            category: 'Jogo',
            contentRating: 'N/A',
            lastUpdated: 'N/A',
            requirements: {
              minAndroidVersion: 'N/A',
              minRam: 'Variável',
              minStorage: 'Variável',
              requiredPermissions: []
            }
          };
        });
      });

      return games;
    } finally {
      await browser.close();
    }
  }

  static async getGameDetails(packageName: string): Promise<MobileGame> {
    console.log('Buscando detalhes do jogo:', packageName);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navegar para a página do jogo
      await page.goto(`https://play.google.com/store/apps/details?id=${packageName}`);
      console.log('Página de detalhes carregada');
      
      // Esperar pelo carregamento
      await page.waitForSelector('h1.Fd93Bb');
      console.log('Título encontrado');

      // Extrair informações detalhadas
      const gameDetails = await page.evaluate(() => {
        console.log('Iniciando extração de detalhes');
        const title = document.querySelector('h1')?.textContent || '';
        const developer = document.querySelector('a[href*="developer"]')?.textContent || '';
        const ratingText = document.querySelector('div[aria-label*="rating"]')?.getAttribute('aria-label') || '';
        const rating = parseFloat(ratingText.match(/\\d+(\\.\\d+)?/)?.[0] || '0');
        
        // Extrair requisitos adicionais
        const additionalInfo = Array.from(document.querySelectorAll('div[data-g-id="additional_info"] div.reAt0'));
        const requirements: { [key: string]: string } = {};
        
        additionalInfo.forEach(info => {
          const label = info.querySelector('div:first-child')?.textContent || '';
          const value = info.querySelector('div:last-child')?.textContent || '';
          requirements[label.toLowerCase()] = value;
        });

        // Extrair permissões
        const permissions = Array.from(document.querySelectorAll('div[aria-label*="Permissions"] span'))
          .map(el => el.textContent || '')
          .filter(text => text.length > 0);

        return {
          id: packageName,
          title,
          packageName,
          developer,
          icon: document.querySelector('img[alt*="icon"]')?.getAttribute('src') || '',
          rating,
          reviews: parseInt(document.querySelector('div[aria-label*="ratings"]')?.textContent?.replace(/[^0-9]/g, '') || '0'),
          size: requirements['size'] || 'Variável',
          installs: requirements['installs'] || 'N/A',
          price: document.querySelector('meta[itemprop="price"]')?.getAttribute('content') || 'Free',
          androidVersion: requirements['android version'] || 'Variável',
          category: requirements['category'] || 'Jogo',
          contentRating: requirements['content rating'] || 'N/A',
          lastUpdated: requirements['updated'] || 'N/A',
          requirements: {
            minAndroidVersion: requirements['android version'] || 'N/A',
            minRam: 'Variável',
            minStorage: requirements['size'] || 'Variável',
            requiredPermissions: permissions
          }
        };
      });

      return gameDetails;
    } finally {
      await browser.close();
    }
  }
}
