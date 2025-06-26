import puppeteer from 'puppeteer';
import { MobileGame } from '../types/MobileGame';

export class PuppeteerPlayStoreService {
  static async searchGames(query: string): Promise<MobileGame[]> {
    console.log('Iniciando busca por:', query);
    
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setDefaultNavigationTimeout(30000);

    try {
      console.log('Navegando para a Play Store...');
      const url = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps&c=GAME`;
      console.log('URL:', url);
      
      await page.goto(url, { waitUntil: 'networkidle0' });
      console.log('Página carregada');

      // Aguardar e verificar elementos
      console.log('Aguardando elementos...');
      await page.waitForSelector('div[role="listitem"]', { visible: true });
      const items = await page.$$('div[role="listitem"]');
      console.log(`Encontrados ${items.length} items`);

      // Extrair informações dos jogos
      const games = await page.evaluate(() => {
        console.log('Iniciando extração de dados...');
        const items = Array.from(document.querySelectorAll('div[role="listitem"]'));
        console.log(`Processando ${items.length} items`);

        return items.slice(0, 10).map(item => {
          try {
            // Debug
            console.log('Processando item:', item.innerHTML);

            // Extrair informações básicas
            const link = item.querySelector('a[href*="details"]');
            const packageName = link?.getAttribute('href')?.match(/details\?id=([^&]+)/)?.[1] || '';
            console.log('Package name:', packageName);

            const titleEl = item.querySelector('h2, span[role="heading"]');
            const title = titleEl?.textContent?.trim() || '';
            console.log('Title:', title);

            const developerEl = item.querySelector('div[class*="developer"], div > div:nth-child(2)');
            const developer = developerEl?.textContent?.trim() || '';
            console.log('Developer:', developer);

            // Extrair avaliações
            const ratingEl = item.querySelector('[aria-label*="stars"], [aria-label*="Rating"]');
            const ratingText = ratingEl?.getAttribute('aria-label') || '0';
            const rating = parseFloat(ratingText.match(/\d+(\.\d+)?/)?.[0] || '0');
            console.log('Rating:', rating);

            // Extrair ícone
            const imgEl = item.querySelector('img');
            const icon = imgEl?.getAttribute('src') || '';
            console.log('Icon:', icon);

            const game: MobileGame = {
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
                minRam: undefined,
                minStorage: undefined,
                requiredPermissions: []
              }
            };
            return game;
          } catch (error) {
            console.error('Erro ao processar item:', error);
            return null;
          }
        }).filter((item): item is MobileGame => item !== null);
      });

      console.log(`Encontrados ${games.length} jogos`);
      return games;
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  static async getGameDetails(packageName: string): Promise<MobileGame> {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setDefaultNavigationTimeout(30000);

    try {
      console.log('Buscando detalhes para:', packageName);
      
      // Navegar para a página do jogo
      const url = `https://play.google.com/store/apps/details?id=${packageName}&hl=pt-BR`;
      console.log('Navegando para:', url);
      
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Aguardar carregamento inicial
      await page.waitForSelector('h1', { visible: true, timeout: 15000 });
      
      // Fazer scroll completo da página
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      // Aguardar carregamento completo
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Extrair todos os dados em uma única chamada evaluate
      const data = await page.evaluate(() => {
        // Funções auxiliares
        const getTextContent = (selector: string): string => {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            const text = el.textContent?.trim();
            if (text) return text;
          }
          return '';
        };

        const getAttributeValue = (selector: string, attribute: string): string => {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            const value = el.getAttribute(attribute)?.trim();
            if (value) return value;
          }
          return '';
        };

        // Título - sempre presente no h1
        const title = getTextContent('h1');

        // Desenvolvedor - tentar vários seletores específicos do Play Store
        const developerSelectors = [
          'a[href*="/developer?"]',
          'a[href*="/dev?"]',
          'div[itemprop="author"] meta[itemprop="name"]',
          'span[itemprop="author"]'
        ];
        const developer = developerSelectors.reduce((acc, selector) => 
          acc || getTextContent(selector) || getAttributeValue(selector, 'content'), 
          '');

        // Ícone - tentar vários seletores específicos do Play Store
        const iconSelectors = [
          'img[alt*="Ícone do app"]',
          'img[alt*="App icon"]',
          'img[itemprop="image"]',
          'div[class*="cover"] img',
          'div[class*="header"] img:first-child'
        ];
        const icon = iconSelectors.reduce((acc, selector) => 
          acc || getAttributeValue(selector, 'src'), 
          '');

        // Rating - usar seletores específicos do Play Store
        const ratingSelectors = [
          'div[itemprop="starRating"] meta[itemprop="ratingValue"]',
          '[aria-label*="stars"]',
          '[aria-label*="estrelas"]'
        ];
        let rating = 0;
        for (const selector of ratingSelectors) {
          const ratingStr = getAttributeValue(selector, 'content') || 
                           getAttributeValue(selector, 'aria-label');
          if (ratingStr) {
            const match = ratingStr.match(/\d+([.,]\d+)?/);
            if (match) {
              rating = parseFloat(match[0].replace(',', '.'));
              break;
            }
          }
        }

        // Reviews - usar seletores específicos do Play Store
        const reviewSelectors = [
          'div[itemprop="starRating"] meta[itemprop="ratingCount"]',
          '[aria-label*="ratings"]',
          '[aria-label*="avaliações"]'
        ];
        let reviews = 0;
        for (const selector of reviewSelectors) {
          const reviewStr = getAttributeValue(selector, 'content') || 
                           getTextContent(selector);
          if (reviewStr) {
            const num = parseInt(reviewStr.replace(/[^0-9]/g, ''));
            if (!isNaN(num)) {
              reviews = num;
              break;
            }
          }
        }

        // Informações adicionais - usar meta tags quando possível
        const additionalInfo: Record<string, string> = {};

        // Tentar meta tags primeiro
        const metaSelectors = {
          size: 'meta[itemprop="fileSize"]',
          installs: 'meta[itemprop="downloadCount"]',
          price: 'meta[itemprop="price"]',
          category: 'meta[itemprop="applicationCategory"]',
          contentRating: 'meta[itemprop="contentRating"]',
          androidVersion: 'meta[itemprop="operatingSystem"]'
        };

        for (const [key, selector] of Object.entries(metaSelectors)) {
          const value = getAttributeValue(selector, 'content');
          if (value) additionalInfo[key] = value;
        }

        // Backup: procurar em elementos da página
        const infoRows = document.querySelectorAll('div[role="listitem"], div[role="list"] > div');
        infoRows.forEach(row => {
          const label = row.querySelector('div:first-child')?.textContent?.toLowerCase().trim();
          const value = row.querySelector('div:nth-child(2)')?.textContent?.trim();

          if (label && value) {
            if (label.includes('tamanho') && !additionalInfo.size) 
              additionalInfo.size = value;
            if (label.includes('instala') && !additionalInfo.installs) 
              additionalInfo.installs = value;
            if (label.includes('android') && !additionalInfo.androidVersion) 
              additionalInfo.androidVersion = value;
            if ((label.includes('conteúdo') || label.includes('classifica')) && !additionalInfo.contentRating) 
              additionalInfo.contentRating = value;
            if (label.includes('atualiz')) 
              additionalInfo.lastUpdated = value;
            if (label.includes('preço') && !additionalInfo.price) 
              additionalInfo.price = value;
          }
        });

        // Permissões - procurar em seção específica
        const permissions = new Set<string>();
        
        // Primeiro procurar por seções com título de permissões
        document.querySelectorAll('h2, div[role="heading"]').forEach(heading => {
          const text = heading.textContent?.toLowerCase() || '';
          if (text.includes('permiss')) {
            // Encontrar o container pai mais próximo
            let container = heading.parentElement;
            while (container && !container.matches('section, div[role="region"]')) {
              container = container.parentElement;
            }
            
            // Se encontrou o container, procurar por spans dentro dele
            if (container) {
              container.querySelectorAll('span').forEach(span => {
                const permText = span.textContent?.trim();
                if (permText && !permText.toLowerCase().includes('permiss')) {
                  permissions.add(permText);
                }
              });
            }
          }
        });
        
        // Backup: procurar por divs com aria-label de permissões
        document.querySelectorAll('div[aria-label*="ermiss"]').forEach(div => {
          div.querySelectorAll('span').forEach(span => {
            const text = span.textContent?.trim();
            if (text) permissions.add(text);
          });
        });

        return {
          title,
          developer,
          icon,
          rating,
          reviews,
          additionalInfo,
          permissions: Array.from(permissions)
        };
      });

      console.log('Dados extraídos:', data);

      // Construir objeto de retorno
      const gameDetails: MobileGame = {
        id: packageName,
        title: data.title,
        packageName,
        developer: data.developer,
        icon: data.icon,
        rating: data.rating,
        reviews: data.reviews,
        size: data.additionalInfo.size || 'Variável',
        installs: data.additionalInfo.installs || 'N/A',
        price: data.additionalInfo.price || 'Free',
        androidVersion: data.additionalInfo.androidVersion || 'Variável',
        category: 'Jogo',
        contentRating: data.additionalInfo.contentRating || 'N/A',
        lastUpdated: data.additionalInfo.lastUpdated || 'N/A',
        requirements: {
          minAndroidVersion: data.additionalInfo.androidVersion || 'N/A',
          minRam: undefined,
          minStorage: data.additionalInfo.size || undefined,
          requiredPermissions: data.permissions
        }
      };

      console.log('Detalhes extraídos com sucesso:', gameDetails);
      return gameDetails;

    } catch (error) {
      console.error('Erro ao extrair detalhes:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
