import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { cores } from '../styles/cores';
import { getDeviceSpecs, saveDeviceSpecs } from '../services/device-info';
import { playStoreApi } from '../services/playstore-api';
import { analyzeCompatibility } from '../services/compatibility-analyzer';
import TelaCarregamentoBase from '../components/TelaCarregamentoBase';
import { formatBytes } from '../utils/formatters';

import type { AppDetails } from '../types/types';
import type { DeviceSpecs } from '../types/DeviceSpecs';
import type { RootStackParamList, CompatibilityResult } from '../types/navigation';

// Não precisamos mais desta interface, pois estamos usando o tipo CompatibilityResult importado

type Props = NativeStackScreenProps<RootStackParamList, 'TelaCarregamentoComparacao'>;

const TelaCarregamentoComparacao = ({ route, navigation }: Props): JSX.Element => {
  const { appId, appName, appIcon } = route.params;

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('=== Iniciando carregamento de dados ===');
        console.log('ID do jogo:', appId);
        console.log('Nome do jogo:', appName);
        await saveDeviceSpecs();
        const appDetailsResult = await playStoreApi.getAppDetails(appId);
        const deviceSpecsResult = await getDeviceSpecs();
        
        console.log('Detalhes do jogo:', JSON.stringify(appDetailsResult, null, 2));
        console.log('Especificações do dispositivo:', JSON.stringify(deviceSpecsResult, null, 2));

        if (!appDetailsResult || !deviceSpecsResult) {
          navigation.goBack();
          return;
        }

        // Verificar compatibilidade usando o analyzeCompatibility
        const compatibility = analyzeCompatibility(deviceSpecsResult, appDetailsResult);
        
        // Calcular pontuação de compatibilidade (0-100)
        const score = compatibility.isCompatible ? 100 : 
                     compatibility.performanceLevel === 'high' ? 90 :
                     compatibility.performanceLevel === 'medium' ? 70 : 50;
        
        console.log('=== Resultado da Análise de Compatibilidade ===');
        console.log('Compatível:', compatibility.isCompatible);
        console.log('Nível de Performance:', compatibility.performanceLevel);
        console.log('Versão Android:', compatibility.details.android.message);
        console.log('Armazenamento:', compatibility.details.storage.message);
        console.log('RAM:', compatibility.details.memory.message);
        console.log('Processador:', compatibility.details.processor.message);
        console.log('GPU:', compatibility.details.gpu.message);
        console.log('Tela:', compatibility.details.screen.message);
        console.log('Mensagem Geral:', compatibility.overallMessage);
        console.log('============================================');

        // Adaptar o resultado para o formato esperado pela TelaComparacao
        const adaptedCompatibility: CompatibilityResult = {
          isCompatible: compatibility.isCompatible,
          score: score,
          reasons: {
            androidVersion: {
              compatible: compatibility.details.android.compatible,
              recommended: compatibility.details.android.requiredVersion || 'Desconhecido',
              current: compatibility.details.android.deviceVersion || 'Desconhecido'
            },
            storage: {
              compatible: compatibility.details.storage.compatible,
              recommended: formatBytes(compatibility.details.storage.required),
              available: formatBytes(compatibility.details.storage.available)
            },
            ram: {
              compatible: compatibility.details.memory.compatible,
              recommended: formatBytes(compatibility.details.memory.recommended),
              available: formatBytes(compatibility.details.memory.available)
            },
            cpu: {
              compatible: compatibility.details.processor.compatible,
              recommended: 'Adequado para jogos',
              available: `${deviceSpecsResult.cpuArchitecture || 'Desconhecido'} (${deviceSpecsResult.numberOfCores || '?'} núcleos)`
            },
            gpu: {
              compatible: compatibility.details.gpu.compatible || false,
              recommended: 'Adequado para jogos',
              available: deviceSpecsResult.model || 'Desconhecido'
            },
            architecture: {
              compatible: true,
              recommended: 'Qualquer',
              available: deviceSpecsResult.cpuArchitecture || 'Desconhecido'
            },
            sensors: {
              compatible: true,
              recommended: 'N/A',
              available: 'Disponível'
            },
            bluetooth: {
              compatible: true,
              recommended: 'N/A',
              available: 'Disponível'
            },
            wifi: {
              compatible: true,
              recommended: 'N/A',
              available: 'Disponível'
            },
            nfc: {
              compatible: true,
              recommended: 'N/A',
              available: 'Disponível'
            },
            gps: {
              compatible: true,
              recommended: 'N/A',
              available: 'Disponível'
            },
            camera: {
              compatible: true,
              recommended: 'N/A',
              available: 'Disponível'
            },
            gyroscope: {
              compatible: true,
              recommended: 'N/A',
              available: 'Disponível'
            },
            permissions: {
              compatible: true,
              missing: []
            }
          },
          recommendations: [compatibility.overallMessage]
        };

        // Usar uma asserção de tipo para resolver os erros de tipo
        // Isso é seguro porque já verificamos que deviceSpecsResult não é nulo
        const completeDeviceSpecs = deviceSpecsResult as unknown as DeviceSpecs;

        // Navegar para TelaDetalhesJogo em vez de TelaComparacao
        navigation.replace('TelaDetalhesJogo', {
          appId: appId,
          app: {
            id: appId,
            name: appName,
            developer: appDetailsResult.developer || '',
            icon: appIcon || appDetailsResult.icon,
            rating: appDetailsResult.rating || 0,
            installs: appDetailsResult.installs || '0'
          }
        });
      } catch (error: any) {
        console.error('=== Erro ao carregar dados ===');
        console.error('Tipo do erro:', error.name);
        console.error('Mensagem:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Dados:', error.response.data);
          console.error('Headers:', error.response.headers);
          console.error('Config:', {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            params: error.config?.params
          });
        }
        // Mostrar alerta com o erro
        Alert.alert(
          'Erro ao carregar dados',
          `Não foi possível carregar os detalhes do jogo. ${error.response?.status === 403 ? 'Verifique a chave da API.' : 'Tente novamente mais tarde.'}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    loadData();
  }, [appId, navigation]);

  return (
    <TelaCarregamentoBase
      mensagem={`Analisando compatibilidade com ${appName}...`}
      icone={appIcon}
    />
  );
};

export default TelaCarregamentoComparacao;
