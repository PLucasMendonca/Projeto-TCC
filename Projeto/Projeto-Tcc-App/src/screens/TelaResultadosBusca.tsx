import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { playStoreApi, SearchResult } from '../services/playstore-api';
import { cores } from '../styles/cores';
import { Ionicons } from '@expo/vector-icons';
import { addToHistory } from '../services/history';

type Props = NativeStackScreenProps<RootStackParamList, 'TelaResultadosBusca'>;

export default function TelaResultadosBusca({ route, navigation }: Props) {
  const { searchQuery } = route.params;
  const [mainResult, setMainResult] = useState<SearchResult | null>(null);
  const [similarApps, setSimilarApps] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    searchApps();
  }, []);

  const searchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar o jogo principal
      const searchResults = await playStoreApi.searchApps(searchQuery);
      if (searchResults.length > 0) {
        const mainApp = searchResults[0];
        setMainResult(mainApp);

        // Buscar jogos similares
        const similarResults = await playStoreApi.getSimilarApps(mainApp.id);
        setSimilarApps(similarResults);
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Não foi possível carregar os resultados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderAppItem = (item: SearchResult, isMainResult: boolean = false) => {
    return (
      <TouchableOpacity
        style={[styles.resultItem, isMainResult && styles.mainResultItem]}
        onPress={async () => {
          try {
            await addToHistory({
              id: item.id,
              name: item.appName,
              image: item.iconUrl
            });
            navigation.navigate('TelaCarregamentoComparacao', { 
              appId: item.id,
              appName: item.appName,
              appIcon: item.iconUrl
            });
          } catch (error) {
            console.error('Erro ao salvar no histórico:', error);
            navigation.navigate('TelaCarregamentoComparacao', { 
              appId: item.id,
              appName: item.appName,
              appIcon: item.iconUrl
            });
          }
        }}
      >
        <Image 
          source={{ uri: item.iconUrl }} 
          style={[styles.appIcon, isMainResult && styles.mainAppIcon]} 
        />
        <View style={styles.appInfo}>
          <Text 
            style={[styles.appTitle, isMainResult && styles.mainAppTitle]} 
            numberOfLines={2} 
            ellipsizeMode="tail"
          >
            {item.appName}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={isMainResult ? 20 : 16} color={cores.destaque} />
            <Text style={[styles.ratingText, isMainResult && styles.mainRatingText]}>
              {item.avgRate ? item.avgRate.toFixed(1) : 'N/A'}
            </Text>
          </View>
          <Text style={[styles.installsText, isMainResult && styles.mainInstallsText]}>
            {item.installsMinCount} instalações
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={cores.primaria}
        translucent
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={cores.secundaria} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          Resultados para "{searchQuery}"
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={cores.secundaria} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={searchApps}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : !mainResult ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noResultsText}>Nenhum resultado encontrado</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Resultado Principal */}
          <View style={styles.mainResultContainer}>
            {renderAppItem(mainResult, true)}
          </View>

          {/* Jogos Similares */}
          {similarApps.length > 0 && (
            <View style={styles.similarAppsContainer}>
              <Text style={styles.similarAppsTitle}>Jogos Similares</Text>
              <FlatList
                data={similarApps}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarAppsList}
                renderItem={({ item }) => renderAppItem(item)}
              />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainResultContainer: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: cores.secundaria,
  },
  similarAppsContainer: {
    paddingVertical: 16,
  },
  similarAppsTitle: {
    color: cores.secundaria,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  similarAppsList: {
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    backgroundColor: cores.primaria,
    borderBottomWidth: 2,
    borderBottomColor: cores.secundaria,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: cores.secundaria,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,

  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: cores.secundaria,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: cores.secundaria,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultsText: {
    color: cores.secundaria,
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: cores.secundaria,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: width * 0.7,
  },
  mainResultItem: {
    width: '100%',
    marginHorizontal: 0,
    backgroundColor: cores.secundaria,
    borderWidth: 2,
    borderColor: cores.secundaria,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: cores.primaria,
  },
  mainAppIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  appTitle: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mainAppTitle: {
    fontSize: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.primaria,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: cores.destaque,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainRatingText: {
    fontSize: 16,
  },
  installsText: {
    color: cores.primaria,
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  mainInstallsText: {
    fontSize: 16,
    opacity: 1,
  },
});
