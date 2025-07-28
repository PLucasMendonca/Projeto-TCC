import { db, auth } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy,
  Timestamp,
  DocumentData,
  doc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot
} from 'firebase/firestore';

export interface SearchHistory {
  id: string;
  gameId: string;
  gameName: string;
  gameImage: string;
  searchDate: Date;
  rating: number;
}

export async function addToHistory(game: { id: string; name: string; image: string }) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se o jogo já existe no histórico
    const historyRef = collection(db, 'search_history');
    const q = query(
      historyRef,
      where('userId', '==', user.uid),
      where('gameId', '==', game.id)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Jogo já existe no histórico, atualizar a data de pesquisa
      const existingDoc = querySnapshot.docs[0];
      const existingData = existingDoc.data();
      const currentRating = existingData.rating || 0;
      
      console.log(`Jogo '${game.name}' já existe no histórico. Atualizando data.`);
      
      // Atualizar apenas a data de pesquisa, mantendo a avaliação
      await updateDoc(doc(db, 'search_history', existingDoc.id), {
        searchDate: Timestamp.now(),
        // Atualizar nome e imagem caso tenham mudado
        gameName: game.name,
        gameImage: game.image
      });
      
      console.log(`Data de pesquisa atualizada para o jogo '${game.name}'. Avaliação mantida: ${currentRating}`);
    } else {
      // Jogo não existe no histórico, adicionar como novo
      console.log(`Adicionando novo jogo ao histórico: '${game.name}'`);
      
      await addDoc(collection(db, 'search_history'), {
        userId: user.uid,
        gameId: game.id,
        gameName: game.name,
        gameImage: game.image,
        searchDate: Timestamp.now(),
        rating: 0
      });
      
      console.log(`Jogo '${game.name}' adicionado ao histórico com sucesso.`);
    }
  } catch (error) {
    console.error('Erro ao adicionar ao histórico:', error);
    throw error;
  }
}

export async function getSearchHistory(): Promise<SearchHistory[]> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const historyRef = collection(db, 'search_history');
    // Consulta básica sem ordenação por enquanto
    const q = query(
      historyRef,
      where('userId', '==', user.uid)
    );

    // Se não houver resultados, adicionar um jogo de exemplo
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // Adicionar vários jogos de exemplo
      const exampleGames = [
        {
          gameId: 'league-of-legends',
          gameName: 'League of Legends',
          gameImage: 'https://www.leagueoflegends.com/static/logo-1200-04b3cace49f2410c0649d4d7bbcb72cf.png',
          rating: 5
        },
        {
          gameId: 'pubg-mobile',
          gameName: 'PUBG Mobile Lite',
          gameImage: 'https://play-lh.googleusercontent.com/JRd05pyBH41qjgsJuWduRJpDeZG0Hnb0yjf6G_LILjvgjCF2ltG2c_JGYfLK19gzJw',
          rating: 4
        },
        {
          gameId: 'fall-guys',
          gameName: 'Fall Guys',
          gameImage: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Fall_Guys_cover.jpg/220px-Fall_Guys_cover.jpg',
          rating: 4
        },
        {
          gameId: 'pokemon-go',
          gameName: 'Pokemon GO',
          gameImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Pokemon_GO_logo.svg/1200px-Pokemon_GO_logo.svg.png',
          rating: 3
        },
        {
          gameId: 'portal',
          gameName: 'Portal',
          gameImage: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Portal_standalonebox.jpg',
          rating: 5
        }
      ];

      // Adicionar cada jogo ao Firestore
      for (const game of exampleGames) {
        await addDoc(collection(db, 'search_history'), {
          userId: user.uid,
          ...game,
          searchDate: Timestamp.now()
        });
      }

      // Buscar novamente após adicionar o exemplo
      // Retornar os jogos de exemplo
      return exampleGames.map((game, index) => ({
        id: `example-${index}`,
        ...game,
        searchDate: new Date()
      }));
    }

    // Mapear todos os resultados do Firestore
    const allResults = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        gameId: data.gameId,
        gameName: data.gameName,
        gameImage: data.gameImage,
        searchDate: data.searchDate.toDate(),
        rating: data.rating || 0
      };
    });

    // Filtrar jogos duplicados, mantendo apenas o mais recente de cada gameId
    const gameMap = new Map<string, SearchHistory>();
    
    // Primeiro ordenamos por data mais recente
    const sortedResults = allResults.sort((a, b) => b.searchDate.getTime() - a.searchDate.getTime());
    
    // Depois adicionamos ao Map, que naturalmente vai manter apenas a primeira ocorrência (a mais recente)
    for (const game of sortedResults) {
      if (!gameMap.has(game.gameId)) {
        gameMap.set(game.gameId, game);
      }
    }
    
    // Convertemos o Map de volta para array
    const uniqueResults = Array.from(gameMap.values());
    
    // Ordenar por data mais recente (já está ordenado, mas garantimos aqui)
    return uniqueResults.sort((a, b) => b.searchDate.getTime() - a.searchDate.getTime());
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }
}

export async function updateGameRating(historyId: string, rating: number) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    // Atualizar rating no documento usando doc() diretamente
    const docRef = doc(db, 'search_history', historyId);
    await updateDoc(docRef, { rating });
  } catch (error) {
    console.error('Erro ao atualizar rating:', error);
    throw error;
  }
}

// Função para limpar duplicatas no histórico
export async function cleanupDuplicateHistory() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    console.log('Iniciando limpeza de histórico duplicado...');
    
    // Buscar todos os itens do histórico do usuário
    const historyRef = collection(db, 'search_history');
    const q = query(historyRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    // Mapear os jogos por gameId
    const gameMap = new Map<string, {doc: QueryDocumentSnapshot, data: any, date: Date}[]>();
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const gameId = data.gameId;
      const date = data.searchDate.toDate();
      
      if (!gameMap.has(gameId)) {
        gameMap.set(gameId, []);
      }
      
      gameMap.get(gameId)?.push({doc, data, date});
    });
    
    // Para cada gameId que tem mais de uma ocorrência
    let deletedCount = 0;
    for (const [gameId, entries] of gameMap.entries()) {
      if (entries.length > 1) {
        // Ordenar por data mais recente
        entries.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        // Manter o primeiro (mais recente) e deletar os outros
        const mostRecent = entries[0];
        const duplicates = entries.slice(1);
        
        // Verificar se o mais recente tem avaliação
        let highestRating = mostRecent.data.rating || 0;
        
        // Verificar se alguma das duplicatas tem avaliação maior
        for (const duplicate of duplicates) {
          const duplicateRating = duplicate.data.rating || 0;
          if (duplicateRating > highestRating) {
            highestRating = duplicateRating;
          }
        }
        
        // Atualizar o item mais recente com a maior avaliação encontrada
        if (highestRating > (mostRecent.data.rating || 0)) {
          await updateDoc(doc(db, 'search_history', mostRecent.doc.id), {
            rating: highestRating
          });
          console.log(`Atualizada avaliação do jogo ${gameId} para ${highestRating}`);
        }
        
        // Deletar as duplicatas
        for (const duplicate of duplicates) {
          await deleteDoc(doc(db, 'search_history', duplicate.doc.id));
          deletedCount++;
        }
      }
    }
    
    console.log(`Limpeza concluída. Removidos ${deletedCount} itens duplicados.`);
    return deletedCount;
  } catch (error) {
    console.error('Erro ao limpar histórico duplicado:', error);
    throw error;
  }
}
