import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  ActivityIndicator, 
  SafeAreaView, 
  Dimensions, 
  ViewStyle, 
  TextStyle, 
  ImageStyle,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { cores } from '../styles/cores';
import { playStoreApi } from '../services/playstore-api';
import { Share, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import type { AppDetails } from '../types/types';
import { getDeviceSpecs, DeviceSpecs, getSavedDeviceSpecs, saveDeviceSpecs } from '../services/device-info';
import { rawgGameApi, GameDetails } from '../services/rawg-api';
import { analyzeCompatibility, CompatibilityResult, formatBytes } from '../services/compatibility-analyzer';

type Props = NativeStackScreenProps<RootStackParamList, 'TelaDetalhesJogo'>;

export default function TelaDetalhesJogo({ route, navigation }: Props) {
  // Função auxiliar para verificar se o jogo precisa de informações de desempenho
  const isHighPerformanceGame = (app: AppDetails | null): boolean => {
    if (!app) return false;
    
    // Verificar se o gênero indica um jogo de alto desempenho
    const highPerformanceGenres = ['Action', 'Racing', 'Arcade', 'Adventure', 'Simulation', 'Sports'];
    if (app.genre && highPerformanceGenres.includes(app.genre)) return true;
    
    // Verificar se as tags indicam um jogo de alto desempenho
    const highPerformanceTags = ['High graphics', '3D', 'Multiplayer', 'Simulation', 'Stylized'];
    if (app.tags && app.tags.some(tag => highPerformanceTags.includes(tag))) return true;
    
    // Verificar se o tamanho do jogo indica que é complexo (mais de 100MB)
    if (app.size && parseFloat(app.size) > 100) return true;
    
    return false;
  };
  const { width: screenWidth } = Dimensions.get('window');
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [rawgDetails, setRawgDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawgLoading, setRawgLoading] = useState(true);
  const [deviceSpecs, setDeviceSpecs] = useState<DeviceSpecs | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'requirements' | 'compatibility'>('overview');
  const [analyzingCompatibility, setAnalyzingCompatibility] = useState(false);
  const { app } = route.params;
  const appBanner = appDetails?.bannerUrl || appDetails?.screenshots?.[0];

  useEffect(() => {
    const fetchDeviceSpecs = async () => {
      try {
        setAnalyzingCompatibility(true);
        // Primeiro tenta obter as especificações salvas
        let specs = await getSavedDeviceSpecs();
        
        // Se não houver especificações salvas, obtém novas
        if (!specs) {
          specs = await getDeviceSpecs();
          // Salva as especificações para uso futuro
          await saveDeviceSpecs();
        }
        
        console.log('Especificações do dispositivo carregadas:', specs);
        setDeviceSpecs(specs);

        // Analisar compatibilidade usando o novo analisador
        if (specs && appDetails) {
          const result = analyzeCompatibility(specs, appDetails);
          setCompatibilityResult(result);
          console.log('Análise de compatibilidade concluída:', result);
        }
      } catch (error) {
        console.error('Erro ao analisar compatibilidade:', error);
      } finally {
        setAnalyzingCompatibility(false);
      }
    };

    fetchDeviceSpecs();
  }, [appDetails]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await playStoreApi.getAppDetails(app.id || '');
        setAppDetails(details);
        
        // Buscar dados da RAWG API após obter os detalhes do Play Store
        if (details) {
          setRawgLoading(true);
          const rawgData = await rawgGameApi.findGameByPlayStoreName(details.title);
          setRawgDetails(rawgData);
          setRawgLoading(false);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [app.id]);

  if (loading || !appDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.secundaria} />
        </View>
      </View>
    );
  }

  const shareApp = async () => {
    try {
      await Share.share({
        message: `Confira ${appDetails.title} na Play Store: ${appDetails.url}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };



  const openPlayStore = () => {
    const url = `market://details?id=${app.id}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://play.google.com/store/apps/details?id=${app.id}`);
    });
  };

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Visão Geral</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
        onPress={() => setActiveTab('details')}
      >
        <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Detalhes</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'compatibility' && styles.activeTabButton]}
        onPress={() => setActiveTab('compatibility')}
      >
        <Text style={[styles.tabText, activeTab === 'compatibility' && styles.activeTabText]}>Compatibilidade</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.description}>
        {rawgDetails?.description || appDetails.description}
      </Text>
      
      {rawgDetails && (
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="gamepad-variant" size={20} color={cores.secundaria} />
            <Text style={styles.infoLabel}>Gêneros:</Text>
            <Text style={styles.infoValue}>{rawgDetails.genres.join(', ')}</Text>
          </View>
          
          {rawgDetails.released && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={cores.secundaria} />
              <Text style={styles.infoLabel}>Lançamento:</Text>
              <Text style={styles.infoValue}>{new Date(rawgDetails.released).toLocaleDateString('pt-BR')}</Text>
            </View>
          )}
          
          {rawgDetails.rating > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="star" size={20} color={cores.secundaria} />
              <Text style={styles.infoLabel}>Avaliação:</Text>
              <Text style={styles.infoValue}>{rawgDetails.rating.toFixed(1)}/5</Text>
            </View>
          )}
          
          {rawgDetails.esrb_rating && (
            <View style={styles.infoRow}>
              <Ionicons name="warning" size={20} color={cores.secundaria} />
              <Text style={styles.infoLabel}>Classificação:</Text>
              <Text style={styles.infoValue}>{rawgDetails.esrb_rating}</Text>
            </View>
          )}
        </View>
      )}
      
      <Text style={styles.sectionTitle}>Screenshots</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.screenshotsContainer}>
        {(rawgDetails?.screenshots || appDetails.screenshots || []).map((screenshot, index) => (
          <Image
            key={index}
            source={{ uri: screenshot }}
            style={styles.screenshot}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      {rawgDetails ? (
        <View style={styles.detailsContainer}>
          {rawgDetails.developers && rawgDetails.developers.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Desenvolvedores:</Text>
              <Text style={styles.detailValue}>{rawgDetails.developers.join(', ')}</Text>
            </View>
          )}
          
          {rawgDetails.publishers && rawgDetails.publishers.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Publicadores:</Text>
              <Text style={styles.detailValue}>{rawgDetails.publishers.join(', ')}</Text>
            </View>
          )}
          
          {rawgDetails.platforms && rawgDetails.platforms.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Plataformas:</Text>
              <Text style={styles.detailValue}>{rawgDetails.platforms.join(', ')}</Text>
            </View>
          )}
          
          {rawgDetails.playtime > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tempo de jogo médio:</Text>
              <Text style={styles.detailValue}>{rawgDetails.playtime} horas</Text>
            </View>
          )}
          
          {rawgDetails.metacritic > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Metacritic:</Text>
              <Text style={styles.detailValue}>{rawgDetails.metacritic}/100</Text>
            </View>
          )}
          
          {rawgDetails.website && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Website:</Text>
              <TouchableOpacity onPress={() => Linking.openURL(rawgDetails.website)}>
                <Text style={[styles.detailValue, styles.link]}>{rawgDetails.website}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {rawgDetails.tags && rawgDetails.tags.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tags:</Text>
              <View style={styles.tagsContainer}>
                {rawgDetails.tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          {rawgLoading ? (
            <ActivityIndicator size="large" color={cores.secundaria} />
          ) : (
            <Text style={styles.noDataText}>Informações detalhadas não disponíveis</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderCompatibilityTab = () => {
    // Calcular a porcentagem de compatibilidade apenas com informações confiáveis
    const calculateCompatibilityPercentage = () => {
      if (!compatibilityResult) return 0;
      
      const details = compatibilityResult.details;
      let compatibleCount = 0;
      let totalChecks = 0;
      
      // Verificar apenas aspectos que podemos obter com confiança
      if (deviceSpecs?.androidVersion && appDetails?.minAndroidVersion) {
        if (details.android.compatible) compatibleCount++;
        totalChecks++;
      }
      
      if (deviceSpecs?.freeStorage && appDetails?.size) {
        if (details.storage.compatible) compatibleCount++;
        totalChecks++;
      }
      
      if (deviceSpecs?.totalMemory) {
        if (details.memory.compatible) compatibleCount++;
        totalChecks++;
      }
      
      if (deviceSpecs?.cpuArchitecture && deviceSpecs?.numberOfCores) {
        if (details.processor.compatible) compatibleCount++;
        totalChecks++;
      }
      
      if (deviceSpecs?.screenWidth && deviceSpecs?.screenHeight && deviceSpecs?.screenDensity) {
        if (details.screen.compatible) compatibleCount++;
        totalChecks++;
      }
      
      // Se não houver verificações, retornar 0
      if (totalChecks === 0) return 0;
      
      return Math.round((compatibleCount / totalChecks) * 100);
    };
    
    // Verificar se temos informações suficientes para mostrar a análise
    const hasEnoughInfo = () => {
      if (!deviceSpecs) return false;
      
      // Verificar se temos pelo menos 2 informações válidas para fazer uma análise significativa
      let validInfoCount = 0;
      
      if (deviceSpecs.androidVersion && deviceSpecs.androidVersion !== 'N/A' && deviceSpecs.androidVersion !== '0') {
        validInfoCount++;
      }
      
      if (deviceSpecs.freeStorage && deviceSpecs.freeStorage > 0) {
        validInfoCount++;
      }
      
      if (deviceSpecs.totalMemory && deviceSpecs.totalMemory > 0) {
        validInfoCount++;
      }
      
      if (deviceSpecs.cpuArchitecture && 
          deviceSpecs.cpuArchitecture !== 'Desconhecido' && 
          deviceSpecs.numberOfCores > 0) {
        validInfoCount++;
      }
      
      if (deviceSpecs.screenWidth > 0 && deviceSpecs.screenHeight > 0) {
        validInfoCount++;
      }
      
      // Precisamos de pelo menos 2 informações válidas para mostrar uma análise significativa
      return validInfoCount >= 2;
    };
    
    return (
      <View style={styles.tabContent}>
        {analyzingCompatibility ? (
          // Tela de carregamento durante a análise
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={cores.secundaria} />
            <Text style={styles.loadingText}>Analisando compatibilidade com seu dispositivo...</Text>
          </View>
        ) : compatibilityResult && hasEnoughInfo() ? (
          // Resultados da análise de compatibilidade
          <ScrollView>
            {/* Resumo da compatibilidade */}
            <View style={[styles.compatibilitySummary, 
              compatibilityResult.performanceLevel === 'high' ? styles.highPerformance : 
              compatibilityResult.performanceLevel === 'medium' ? styles.mediumPerformance : 
              styles.lowPerformance
            ]}>
              <View style={styles.compatibilityHeaderRow}>
                <MaterialCommunityIcons 
                  name={compatibilityResult.isCompatible ? "check-circle" : "alert-circle"} 
                  size={24} 
                  color={compatibilityResult.isCompatible ? "#27ae60" : "#e74c3c"} 
                />
                <Text style={styles.compatibilityStatus}>
                  {compatibilityResult.isCompatible ? "Compatível" : "Incompatível"}
                </Text>
              </View>
              
              {/* Porcentagem de compatibilidade */}
              <View style={{alignItems: 'center', marginVertical: 15}}>
                <Text style={{color: '#fff', fontSize: 18, marginBottom: 5}}>
                  Compatibilidade: {calculateCompatibilityPercentage()}%
                </Text>
                <View style={{height: 10, width: '100%', backgroundColor: '#333', borderRadius: 5}}>
                  <View 
                    style={{
                      height: 10, 
                      width: `${calculateCompatibilityPercentage()}%`, 
                      backgroundColor: compatibilityResult.isCompatible ? '#27ae60' : '#e74c3c',
                      borderRadius: 5
                    }}
                  />
                </View>
              </View>
              
              <Text style={styles.performanceLevel}>
                Desempenho esperado: {compatibilityResult.performanceLevel === 'high' ? "Alto" : 
                compatibilityResult.performanceLevel === 'medium' ? "Médio" : "Baixo"}
              </Text>
              <Text style={styles.overallMessage}>{compatibilityResult.overallMessage}</Text>
            </View>
            
            {/* Informações do dispositivo - apenas o que podemos comparar com o jogo */}
            <View style={styles.deviceInfoSection}>
              <Text style={styles.compatibilityTitle}>Seu dispositivo</Text>
              
              {/* Modelo do dispositivo - mostrar apenas se não for nulo ou vazio */}
              {deviceSpecs?.brand && deviceSpecs?.model && 
               deviceSpecs.brand !== 'Desconhecido' && 
               deviceSpecs.model !== 'Desconhecido' && 
               deviceSpecs.brand !== 'N/A' && 
               deviceSpecs.model !== 'N/A' && (
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Modelo:</Text>
                  <Text style={styles.deviceInfoValue}>{deviceSpecs.brand} {deviceSpecs.model}</Text>
                </View>
              )}
              
              {/* Android - mostrar apenas se não for nulo, zero ou N/A */}
              {deviceSpecs?.androidVersion && 
               appDetails?.minAndroidVersion && 
               deviceSpecs.androidVersion !== 'N/A' && 
               deviceSpecs.androidVersion !== '0' && (
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Android:</Text>
                  <Text style={styles.deviceInfoValue}>Versão {deviceSpecs.androidVersion}</Text>
                </View>
              )}
              
              {/* Armazenamento - mostrar apenas se não for zero e o jogo tiver tamanho */}
              {deviceSpecs?.freeStorage && 
               deviceSpecs.freeStorage > 1024 * 1024 * 10 && /* Pelo menos 10MB */ 
               appDetails?.size && 
               appDetails.size !== '0' && (
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Armazenamento:</Text>
                  <Text style={styles.deviceInfoValue}>
                    {formatBytes(deviceSpecs.freeStorage)} disponível
                  </Text>
                </View>
              )}
              
              {/* Memória RAM - mostrar apenas se não for zero e o jogo for de alto desempenho */}
              {deviceSpecs?.totalMemory && 
               deviceSpecs.totalMemory > 1024 * 1024 * 100 && /* Pelo menos 100MB */ 
               isHighPerformanceGame(appDetails) && (
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Memória RAM:</Text>
                  <Text style={styles.deviceInfoValue}>
                    {formatBytes(deviceSpecs.totalMemory)}
                  </Text>
                </View>
              )}
              
              {/* Processador - mostrar apenas se não for nulo ou desconhecido */}
              {deviceSpecs?.cpuArchitecture && 
               deviceSpecs?.numberOfCores && 
               deviceSpecs.numberOfCores > 0 && 
               deviceSpecs.cpuArchitecture !== 'Desconhecido' && 
               deviceSpecs.cpuArchitecture !== 'N/A' && 
               isHighPerformanceGame(appDetails) && (
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Processador:</Text>
                  <Text style={styles.deviceInfoValue}>
                    {deviceSpecs.cpuArchitecture.includes('arm') ? 'ARM' : deviceSpecs.cpuArchitecture} ({deviceSpecs.numberOfCores} núcleos)
                  </Text>
                </View>
              )}
            </View>
            {/* Detalhes da compatibilidade - apenas mostrar o que podemos comparar com o jogo */}
            <View style={styles.compatibilityDetailsSection}>
              <Text style={styles.compatibilityTitle}>Detalhes da compatibilidade</Text>
              
              {/* Android - mostrar apenas se não for nulo, zero ou N/A */}
              {deviceSpecs?.androidVersion && 
               appDetails?.minAndroidVersion && 
               compatibilityResult?.details?.android && 
               deviceSpecs.androidVersion !== 'N/A' && 
               deviceSpecs.androidVersion !== '0' && 
               compatibilityResult.details.android.message && 
               compatibilityResult.details.android.message !== 'N/A' && 
               !compatibilityResult.details.android.message.includes('desconhecido') && (
                <View style={styles.compatibilityDetailItem}>
                  <View style={styles.compatibilityDetailHeader}>
                    <View style={[styles.compatibilityIndicator, 
                      compatibilityResult.details.android.compatible ? styles.compatible : styles.incompatible
                    ]}>
                      <Ionicons 
                        name={compatibilityResult.details.android.compatible ? "checkmark" : "close"} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.compatibilityDetailTitle}>Sistema Android</Text>
                  </View>
                  <Text style={styles.compatibilityDetailMessage}>
                    {compatibilityResult.details.android.message}
                  </Text>
                </View>
              )}
              
              {/* Armazenamento - mostrar apenas se não for zero e o jogo tiver tamanho */}
              {deviceSpecs?.freeStorage && 
               deviceSpecs.freeStorage > 1024 * 1024 * 10 && /* Pelo menos 10MB */ 
               appDetails?.size && 
               appDetails.size !== '0' && 
               compatibilityResult?.details?.storage && 
               compatibilityResult.details.storage.message && 
               compatibilityResult.details.storage.message !== 'N/A' && 
               !compatibilityResult.details.storage.message.includes('desconhecido') && (
                <View style={styles.compatibilityDetailItem}>
                  <View style={styles.compatibilityDetailHeader}>
                    <View style={[styles.compatibilityIndicator, 
                      compatibilityResult.details.storage.compatible ? styles.compatible : styles.incompatible
                    ]}>
                      <Ionicons 
                        name={compatibilityResult.details.storage.compatible ? "checkmark" : "close"} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.compatibilityDetailTitle}>Armazenamento</Text>
                  </View>
                  <Text style={styles.compatibilityDetailMessage}>
                    {compatibilityResult.details.storage.message}
                  </Text>
                </View>
              )}
              
              {/* Memória RAM - mostrar apenas se não for zero e o jogo for de alto desempenho */}
              {deviceSpecs?.totalMemory && 
               deviceSpecs.totalMemory > 1024 * 1024 * 100 && /* Pelo menos 100MB */ 
               compatibilityResult?.details?.memory && 
               compatibilityResult.details.memory.message && 
               compatibilityResult.details.memory.message !== 'N/A' && 
               !compatibilityResult.details.memory.message.includes('desconhecido') && 
               isHighPerformanceGame(appDetails) && (
                <View style={styles.compatibilityDetailItem}>
                  <View style={styles.compatibilityDetailHeader}>
                    <View style={[styles.compatibilityIndicator, 
                      compatibilityResult.details.memory.compatible ? styles.compatible : styles.incompatible
                    ]}>
                      <Ionicons 
                        name={compatibilityResult.details.memory.compatible ? "checkmark" : "close"} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.compatibilityDetailTitle}>Memória RAM</Text>
                  </View>
                  <Text style={styles.compatibilityDetailMessage}>
                    {compatibilityResult.details.memory.message}
                  </Text>
                </View>
              )}
              
              {/* Processador - mostrar apenas se não for nulo ou desconhecido */}
              {deviceSpecs?.cpuArchitecture && 
               deviceSpecs?.numberOfCores && 
               deviceSpecs.numberOfCores > 0 && 
               deviceSpecs.cpuArchitecture !== 'Desconhecido' && 
               deviceSpecs.cpuArchitecture !== 'N/A' && 
               compatibilityResult?.details?.processor && 
               compatibilityResult.details.processor.message && 
               compatibilityResult.details.processor.message !== 'N/A' && 
               !compatibilityResult.details.processor.message.includes('desconhecido') && 
               isHighPerformanceGame(appDetails) && (
                <View style={styles.compatibilityDetailItem}>
                  <View style={styles.compatibilityDetailHeader}>
                    <View style={[styles.compatibilityIndicator, 
                      compatibilityResult.details.processor.compatible ? styles.compatible : styles.incompatible
                    ]}>
                      <Ionicons 
                        name={compatibilityResult.details.processor.compatible ? "checkmark" : "close"} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.compatibilityDetailTitle}>Processador</Text>
                  </View>
                  <Text style={styles.compatibilityDetailMessage}>
                    {compatibilityResult.details.processor.message}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Requisitos do Play Store - apenas se tivermos as informações */}
            {appDetails?.minAndroidVersion && (
              <View style={styles.playStoreRequirements}>
                <Text style={styles.playStoreRequirementsTitle}>Requisitos do Play Store</Text>
                <View style={styles.playStoreRequirementItem}>
                  <Text style={styles.playStoreRequirementLabel}>Android mínimo:</Text>
                  <Text style={styles.playStoreRequirementValue}>{appDetails.minAndroidVersion}</Text>
                </View>
                {appDetails.size && (
                  <View style={styles.playStoreRequirementItem}>
                    <Text style={styles.playStoreRequirementLabel}>Tamanho:</Text>
                    <Text style={styles.playStoreRequirementValue}>{appDetails.size}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        ) : (
          // Mensagem se não for possível analisar a compatibilidade
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Não foi possível analisar a compatibilidade</Text>
            <Text style={{color: '#aaa', marginTop: 10, textAlign: 'center', marginBottom: 20}}>
              Não conseguimos obter informações suficientes do seu dispositivo para realizar a análise de compatibilidade.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setAnalyzingCompatibility(true);
                const fetchDeviceSpecs = async () => {
                  try {
                    const specs = await getDeviceSpecs();
                    setDeviceSpecs(specs);
                    if (specs && appDetails) {
                      const result = analyzeCompatibility(specs, appDetails);
                      setCompatibilityResult(result);
                    }
                  } catch (error) {
                    console.error('Erro ao analisar compatibilidade:', error);
                  } finally {
                    setAnalyzingCompatibility(false);
                  }
                };
                fetchDeviceSpecs();
              }}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
              

  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.headerContainer}>
        <View style={styles.bannerContainer}>
          {appBanner ? (
            <Image
              source={{ uri: appBanner }}
              style={styles.banner}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.banner, { backgroundColor: '#333' }]} />
          )}
          <View style={styles.headerOverlay} />
        </View>
        <View style={styles.headerContentWrapper}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfoContainer}>
            <Image
              source={{ uri: appDetails.icon }}
              style={styles.headerIcon}
              resizeMode="cover"
            />
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitleDetail}>{appDetails.title}</Text>
              <Text style={styles.headerSubtitle}>{appDetails.developer}</Text>
              <View style={styles.headerRatingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.headerRatingText}>
                  {appDetails.rating?.toFixed(1)} ({appDetails.ratesCount?.toLocaleString()})
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {renderTabButtons()}

      <ScrollView style={styles.scrollView}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'compatibility' && renderCompatibilityTab()}

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={shareApp}>
            <Ionicons name="share-social" size={22} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Compartilhar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#01875f' }]} onPress={openPlayStore}>
            <Ionicons name="logo-google-playstore" size={22} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Play Store</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Styles = {
  container: ViewStyle;
  scrollView: ViewStyle;
  loadingContainer: ViewStyle;
  headerContainer: ViewStyle;
  bannerContainer: ViewStyle;
  banner: ImageStyle;
  blurOverlay: ViewStyle;
  headerContent: ViewStyle;
  backButton: ViewStyle;
  headerInfo: ViewStyle;
  loadingText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  compatibilitySummary: ViewStyle;
  highPerformance: ViewStyle;
  mediumPerformance: ViewStyle;
  lowPerformance: ViewStyle;
  compatibilityHeaderRow: ViewStyle;
  compatibilityStatus: TextStyle;
  performanceLevel: TextStyle;
  overallMessage: TextStyle;
  deviceInfoSection: ViewStyle;
  deviceInfoRow: ViewStyle;
  deviceInfoLabel: TextStyle;
  deviceInfoValue: TextStyle;
  compatibilityDetailsSection: ViewStyle;
  compatibilityDetailItem: ViewStyle;
  compatibilityDetailHeader: ViewStyle;
  compatibilityDetailTitle: TextStyle;
  compatibilityDetailMessage: TextStyle;
  unknown: ViewStyle;
  headerIcon: ImageStyle;
  headerText: ViewStyle;
  headerTitle: TextStyle;
  headerDeveloper: TextStyle;
  shareButton: ViewStyle;
  mainInfo: ViewStyle;
  icon: ImageStyle;
  infoContainer: ViewStyle;
  title: TextStyle;
  developer: TextStyle;
  ratingContainer: ViewStyle;
  rating: TextStyle;
  reviews: TextStyle;
  installs: TextStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  compareButton: ViewStyle;
  installButton: ViewStyle;
  buttonText: TextStyle;
  screenshotsContainer: ViewStyle;
  screenshot: ImageStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  description: TextStyle;
  reviewItem: ViewStyle;
  reviewHeader: ViewStyle;
  reviewerName: TextStyle;
  reviewRating: TextStyle;
  reviewContent: TextStyle;
  reviewDate: TextStyle;
  similarAppItem: ViewStyle;
  similarAppIcon: ImageStyle;
  similarAppTitle: TextStyle;
  similarAppRating: TextStyle;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
    paddingTop: StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: cores.primaria,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  headerDeveloper: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: cores.primaria,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: cores.secundaria,
  },
  tabText: {
    color: '#aaa',
    fontWeight: '500',
  },
  activeTabText: {
    color: cores.secundaria,
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  button: {
    backgroundColor: cores.secundaria,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: cores.primaria,
    fontWeight: 'bold',
  },
  mainInfo: {
    padding: 16,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.secundaria,
    marginBottom: 16,
    marginTop: 20,
  },
  screenshot: {
    width: 280,
    height: 160,
    borderRadius: 8,
    marginRight: 10,
  },
  screenshotsContainer: {
    marginVertical: 10,
  },
  infoContainer: {
    marginVertical: 20,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 10,
    width: 100,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  detailsContainer: {
    marginVertical: 10,
  },
  detailItem: {
    marginBottom: 15,
  },
  detailLabel: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tagItem: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 3,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noDataText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
  },
  requirementsContainer: {
    marginVertical: 10,
  },
  requirementSection: {
    marginBottom: 20,
  },
  requirementTitle: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  requirementText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  playStoreRequirements: {
    marginTop: 20,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
    width: '100%',
  },
  playStoreRequirementsTitle: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playStoreRequirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  playStoreRequirementLabel: {
    color: '#aaa',
    fontSize: 14,
    width: 150,
  },
  playStoreRequirementValue: {
    color: '#fff',
    fontSize: 14,
  },
  compatibilityContainer: {
    marginTop: 20,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
  },
  compatibilityTitle: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  compatibilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  compatibilityLabel: {
    color: '#fff',
    fontSize: 14,
  },
  compatibilityIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatible: {
    backgroundColor: '#27ae60',
  },
  incompatible: {
    backgroundColor: '#e74c3c',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#1E88E5', // Azul mais vibrante
    margin: 5,
    borderRadius: 8,
    elevation: 3, // Adiciona sombra no Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  similarAppsContainer: {
    marginTop: 20,
  },
  similarAppItem: {
    width: 120,
    marginRight: 10,
    alignItems: 'center',
  },
  similarAppImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  similarAppName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  similarAppDeveloper: {
    color: '#aaa',
    fontSize: 10,
  },
  

  compatibilitySummary: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  highPerformance: {
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
    borderColor: '#27ae60',
    borderWidth: 1,
  },
  mediumPerformance: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    borderColor: '#f39c12',
    borderWidth: 1,
  },
  lowPerformance: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  compatibilityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  compatibilityStatus: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  performanceLevel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  overallMessage: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  deviceInfoSection: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deviceInfoLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  deviceInfoValue: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
  },
  compatibilityDetailsSection: {
    marginBottom: 20,
  },
  compatibilityDetailItem: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  compatibilityDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  compatibilityDetailTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  compatibilityDetailMessage: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  unknown: {
    backgroundColor: '#7f8c8d',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  retryButton: {
    backgroundColor: cores.secundaria,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerContentWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  headerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitleDetail: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 8,
  },
  headerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRatingText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  reviewerName: {
    color: cores.primaria,
    fontWeight: 'bold',
  },
  reviewRating: {
    color: cores.primaria,
  },
  reviewContent: {
    color: cores.primaria,
    fontSize: 14,
    lineHeight: 20,
  },
  reviewDate: {
    color: cores.primaria,
    fontSize: 12,
    opacity: 0.8,
    marginTop: 8,
  },
  similarAppItemDetails: {
    width: 120,
    marginRight: 12,
  },
  similarAppIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
  },
  similarAppTitle: {
    color: cores.secundaria,
    fontSize: 14,
    marginBottom: 4,
  },
  similarAppRatingText: {
    color: cores.secundaria,
    fontSize: 12,
    marginLeft: 4,
  },

});
