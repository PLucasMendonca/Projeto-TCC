import React, { useEffect, useState } from 'react';
import ConfigModal from '../components/ConfigModal';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { cores } from '../styles/cores';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { logout } from '../services/auth';
import { DeviceSpecs, getDeviceSpecs, formatBytes, saveDeviceSpecs } from '../services/device-info';
import { playStoreApi, SearchResult } from '../services/playstore-api';
import debounce from 'lodash/debounce';


type Props = NativeStackScreenProps<RootStackParamList, 'TelaInicial'>;

export default function TelaInicial({ navigation }: Props) {
  const [deviceSpecs, setDeviceSpecs] = useState<DeviceSpecs | null>(null);
  const [loading, setLoading] = useState(true);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDeviceSpecs();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim().length === 0) return;
    navigation.navigate('TelaResultadosBusca', { searchQuery: searchQuery.trim() });
  };

  const loadDeviceSpecs = async () => {
    try {
      console.log('Carregando especificações do dispositivo...');
      const specs = await getDeviceSpecs();
      setDeviceSpecs(specs);
      await saveDeviceSpecs(); // Salva as specs para uso futuro
      console.log('Especificações carregadas e salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar specs:', error);
    } finally {
      setLoading(false);
    }
  };




  const handleConfigOption = (option: 'perfil' | 'historico' | 'feedback') => {
    switch (option) {
      case 'perfil':
        navigation.navigate('TelaPerfil');
        break;
      case 'historico':
        navigation.navigate('TelaHistorico');
        break;
      case 'feedback':
        navigation.navigate('TelaFeedback');
        break;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('TelaLogin');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setConfigModalVisible(true)}>
          <Ionicons name="settings-outline" size={24} color={cores.secundaria} />
        </TouchableOpacity>
        
        <Text style={styles.logo}>GamerSlayer</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={cores.secundaria} />
        </TouchableOpacity>
      </View>

      {/* Área de Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={cores.complementar} />
          <TextInput
            style={styles.searchInput}
            placeholder="Digite seu jogo..."
            placeholderTextColor={cores.destaque}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Área de Especificações do Dispositivo */}
      <View style={styles.specsContainer}>
        <Text style={styles.specsTitle}>Especificações do Dispositivo</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={cores.secundaria} style={styles.loader} />
        ) : deviceSpecs ? (
          <ScrollView style={styles.specsContent} showsVerticalScrollIndicator={true}>
            {/* Sistema */}
            <View style={styles.specGroup}>
              <Text style={styles.specGroupTitle}>Sistema</Text>
              <Text style={styles.specItem}>Sistema: {deviceSpecs.systemName}</Text>
              <Text style={styles.specItem}>Versão: {deviceSpecs.systemVersion}</Text>
              {deviceSpecs.apiLevel > 0 && (
                <Text style={styles.specItem}>Nível API: {deviceSpecs.apiLevel}</Text>
              )}
            </View>

            {/* Hardware */}
            <View style={styles.specGroup}>
              <Text style={styles.specGroupTitle}>Hardware</Text>
              <Text style={styles.specItem}>Marca: {deviceSpecs.brand}</Text>
              <Text style={styles.specItem}>Modelo: {deviceSpecs.model}</Text>
              <Text style={styles.specItem}>CPU: {deviceSpecs.cpuArchitecture}</Text>
              <Text style={styles.specItem}>Núcleos: {deviceSpecs.numberOfCores}</Text>
              {deviceSpecs.gpuModel && (
                <Text style={styles.specItem}>GPU: {deviceSpecs.gpuModel}</Text>
              )}
            </View>

            {/* Memória */}
            <View style={styles.specGroup}>
              <Text style={styles.specGroupTitle}>Memória RAM</Text>
              <Text style={styles.specItem}>Total: {formatBytes(deviceSpecs.totalMemory)}</Text>
              <Text style={styles.specItem}>Disponível: {formatBytes(deviceSpecs.freeMemory)}</Text>
            </View>

            {/* Armazenamento */}
            <View style={styles.specGroup}>
              <Text style={styles.specGroupTitle}>Armazenamento</Text>
              <Text style={styles.specItem}>Total: {formatBytes(deviceSpecs.totalStorage)}</Text>
              <Text style={styles.specItem}>Disponível: {formatBytes(deviceSpecs.freeStorage)}</Text>
            </View>

            {/* Tela */}
            <View style={styles.specGroup}>
              <Text style={styles.specGroupTitle}>Tela</Text>
              <Text style={styles.specItem}>Resolução: {Math.round(deviceSpecs.screenWidth)}x{Math.round(deviceSpecs.screenHeight)}</Text>
              <Text style={styles.specItem}>Densidade: {deviceSpecs.screenDensity}dpi</Text>
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.errorText}>Erro ao carregar especificações</Text>
        )}
      </View>

      {/* Área de Categorias */}

      <ConfigModal
        visible={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
        onSelectOption={handleConfigOption}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  suggestionsContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    backgroundColor: cores.primaria,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.secundaria,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.secundaria,
  },
  suggestionText: {
    color: cores.secundaria,
    marginLeft: 8,
    fontSize: 14,
  },
  searchLoader: {
    marginTop: 20,
  },
  searchResults: {
    marginTop: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.secundaria,
  },
  searchResultIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  searchResultRatingText: {
    color: cores.secundaria,
    marginLeft: 4,
    fontSize: 14,
  },
  searchResultPrice: {
    color: cores.secundaria,
    marginTop: 4,
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: cores.primaria,
    borderBottomWidth: 1,
    borderBottomColor: cores.secundaria,
  },
  configButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  searchContainer: {
    padding: 16,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.secundaria,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    marginLeft: 10,
    color: cores.primaria,
  },
  searchButton: {
    backgroundColor: cores.secundaria,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  specsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    margin: 16,
  },
  specsTitle: {
    color: cores.secundaria,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  specsContent: {
    flex: 1,
  },
  specGroup: {
    marginBottom: 16,
    backgroundColor: cores.secundaria,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  specGroupTitle: {
    color: cores.primaria,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  specItem: {
    color: cores.primaria,
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 8,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.secundaria,
  },

  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
  },
  gamesList: {
    marginTop: 20,
  },
  gameItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: cores.secundaria,
    borderRadius: 10,
    marginBottom: 10,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  gameInfo: {
    marginLeft: 10,
    flex: 1,
  },
  gameTitle: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameDeveloper: {
    color: cores.primaria,
    fontSize: 14,
    opacity: 0.8,
  },
  gameRating: {
    color: cores.primaria,
    fontSize: 14,
    marginTop: 4,
  },

});
