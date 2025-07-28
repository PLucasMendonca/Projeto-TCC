import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../styles/cores';
import { getSearchHistory, updateGameRating, SearchHistory, cleanupDuplicateHistory } from '../services/history';

interface TelaHistoricoProps {
  navigation: any;
}

export default function TelaHistorico({ navigation }: TelaHistoricoProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupDone, setCleanupDone] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const searchHistory = await getSearchHistory();
      setHistory(searchHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCleanupHistory = async () => {
    try {
      setCleaningUp(true);
      const deletedCount = await cleanupDuplicateHistory();
      console.log(`Removidos ${deletedCount} itens duplicados`);
      
      // Recarregar o histórico após a limpeza
      await loadHistory();
      setCleanupDone(true);
      
      // Esconder a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setCleanupDone(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    } finally {
      setCleaningUp(false);
    }
  };

  const handleRating = async (itemId: string, newRating: number) => {
    try {
      await updateGameRating(itemId, newRating);
      // Atualiza o estado local
      setHistory(history.map(item => 
        item.id === itemId ? { ...item, rating: newRating } : item
      ));
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
    }
  };

  const renderStars = (itemId: string, rating: number = 0) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRating(itemId, star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={24}
              color={cores.secundaria}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: SearchHistory }) => (
    <View style={styles.gameCard}>
      {item.gameImage ? (
        <Image 
          source={{ uri: item.gameImage }} 
          style={styles.gameImage}
        />
      ) : (
        <View style={[styles.gameImage, styles.placeholderImage]}>
          <Ionicons name="game-controller" size={24} color={cores.secundaria} />
        </View>
      )}
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.gameName}</Text>
        {renderStars(item.id, item.rating)}
      </View>
      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => {
          // Navegar para detalhes do jogo
          // navigation.navigate('GameDetails', { gameId: item.gameId });
        }}
      >
        <Ionicons name="chevron-forward" size={24} color={cores.secundaria} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={cores.secundaria} />
        </TouchableOpacity>
        <Text style={styles.title}>Lista de Jogos Pesquisados</Text>
        <TouchableOpacity 
          onPress={handleCleanupHistory}
          style={styles.cleanupButton}
          disabled={cleaningUp}
        >
          <Ionicons name="refresh" size={24} color={cores.secundaria} />
        </TouchableOpacity>
      </View>
      
      {cleanupDone && (
        <View style={styles.cleanupMessage}>
          <Text style={styles.cleanupMessageText}>Histórico organizado com sucesso!</Text>
        </View>
      )}
      
      {cleaningUp && (
        <View style={styles.cleanupMessage}>
          <ActivityIndicator size="small" color={cores.secundaria} />
          <Text style={styles.cleanupMessageText}>Organizando histórico...</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.secundaria} />
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={cores.secundaria} />
              <Text style={styles.emptyText}>
                Nenhum jogo pesquisado ainda
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cleanupButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  cleanupMessage: {
    backgroundColor: cores.primaria,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cleanupMessageText: {
    color: cores.secundaria,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 70,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 2,
    shadowColor: cores.secundaria,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gameImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
    marginLeft: 16,
  },
  gameName: {
    fontSize: 18,
    fontWeight: '600',
    color: cores.secundaria,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 6,
  },
  detailsButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: cores.secundaria,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
