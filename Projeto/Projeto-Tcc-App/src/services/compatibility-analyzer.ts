import { DeviceSpecs } from './device-info';
import { AppDetails } from '../types/types';

export interface CompatibilityResult {
  isCompatible: boolean;
  performanceLevel: 'low' | 'medium' | 'high';
  details: {
    android: {
      compatible: boolean;
      deviceVersion: string;
      requiredVersion: string;
      message: string;
    };
    storage: {
      compatible: boolean;
      available: number;
      required: number;
      message: string;
    };
    memory: {
      compatible: boolean;
      available: number;
      recommended: number;
      message: string;
    };
    processor: {
      compatible: boolean;
      architecture: string;
      cores: number;
      message: string;
    };
    gpu: {
      compatible: boolean | null;
      message: string;
    };
    screen: {
      compatible: boolean;
      resolution: string;
      density: number;
      message: string;
    };
  };
  overallMessage: string;
}

// Função para converter string de tamanho para bytes
function sizeToBytes(sizeStr: string): number {
  if (!sizeStr) return 0;
  
  // Remover espaços e converter para minúsculas
  sizeStr = sizeStr.toLowerCase().trim();
  
  // Extrair o número e a unidade
  const match = sizeStr.match(/^([\d.]+)\s*([kmgt]?b)?$/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  // Converter para bytes
  switch (unit.toLowerCase()) {
    case 'kb':
      return value * 1024;
    case 'mb':
      return value * 1024 * 1024;
    case 'gb':
      return value * 1024 * 1024 * 1024;
    case 'tb':
      return value * 1024 * 1024 * 1024 * 1024;
    default:
      return value;
  }
}

// Função para converter bytes para string legível
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Função para extrair a versão principal do Android
function extractMajorVersion(versionStr: string): number {
  if (!versionStr) return 0;
  
  // Extrair o primeiro número da string de versão
  const match = versionStr.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// Função para analisar a compatibilidade do jogo com o dispositivo
export function analyzeCompatibility(
  deviceSpecs: DeviceSpecs,
  appDetails: AppDetails
): CompatibilityResult {
  // Verificar compatibilidade de versão do Android
  const deviceAndroidVersion = extractMajorVersion(deviceSpecs.androidVersion);
  const requiredAndroidVersion = extractMajorVersion(appDetails.minAndroidVersion || '');
  const androidCompatible = deviceAndroidVersion >= requiredAndroidVersion;
  
  // Verificar compatibilidade de armazenamento
  const appSize = sizeToBytes(appDetails.size || '50MB'); // Tamanho padrão se não especificado
  const storageCompatible = deviceSpecs.freeStorage >= appSize;
  
  // Verificar compatibilidade de memória
  // A maioria dos jogos mobile modernos precisa de pelo menos 2GB de RAM
  const recommendedRam = 2 * 1024 * 1024 * 1024; // 2GB em bytes
  const memoryCompatible = deviceSpecs.totalMemory >= recommendedRam;
  
  // Verificar compatibilidade de processador
  // Assumimos que processadores arm64 ou x86_64 são compatíveis com a maioria dos jogos
  const processorCompatible = 
    deviceSpecs.cpuArchitecture.includes('arm64') || 
    deviceSpecs.cpuArchitecture.includes('x86_64');
  
  // Verificar compatibilidade de GPU
  // Não temos informações específicas da GPU, então fazemos uma estimativa baseada no modelo
  const gpuCompatible = deviceSpecs.model ? true : null; // null significa "não sabemos"
  
  // Verificar compatibilidade de tela
  // Assumimos que uma densidade de tela de pelo menos 2 (equivalente a 160dpi) é adequada
  const screenCompatible = deviceSpecs.screenDensity >= 2;
  
  // Determinar o nível de desempenho esperado
  let performanceLevel: 'low' | 'medium' | 'high' = 'medium';
  
  // Contagem de fatores positivos e negativos
  const positiveFactors = [
    deviceAndroidVersion > requiredAndroidVersion + 2, // Versão Android bem acima da mínima
    deviceSpecs.freeStorage > appSize * 3, // Muito espaço livre
    deviceSpecs.totalMemory > recommendedRam * 1.5, // Muita RAM
    deviceSpecs.numberOfCores >= 6, // Muitos núcleos
    screenCompatible
  ].filter(Boolean).length;
  
  const negativeFactors = [
    deviceAndroidVersion <= requiredAndroidVersion, // Versão Android no limite
    deviceSpecs.freeStorage < appSize * 1.5, // Pouco espaço livre
    deviceSpecs.totalMemory < recommendedRam, // Pouca RAM
    deviceSpecs.numberOfCores <= 4, // Poucos núcleos
    !screenCompatible
  ].filter(Boolean).length;
  
  // Determinar o nível de desempenho com base nos fatores
  if (positiveFactors >= 4) {
    performanceLevel = 'high';
  } else if (negativeFactors >= 3) {
    performanceLevel = 'low';
  }
  
  // Verificar compatibilidade geral
  const isCompatible = androidCompatible && storageCompatible && memoryCompatible;
  
  // Gerar mensagens específicas
  const androidMessage = androidCompatible 
    ? appDetails.minAndroidVersion 
      ? `Seu Android ${deviceSpecs.androidVersion} é compatível com o requisito mínimo (Android ${appDetails.minAndroidVersion}).`
      : `Seu Android ${deviceSpecs.androidVersion} é compatível com este jogo.`
    : appDetails.minAndroidVersion 
      ? `Seu Android ${deviceSpecs.androidVersion} é inferior ao requisito mínimo (Android ${appDetails.minAndroidVersion}).`
      : `Seu Android ${deviceSpecs.androidVersion} pode não ser compatível com este jogo.`;
  
  const storageMessage = storageCompatible
    ? appDetails.size 
      ? `Você tem ${formatBytes(deviceSpecs.freeStorage)} de espaço livre, suficiente para este jogo (${appDetails.size}).`
      : `Você tem ${formatBytes(deviceSpecs.freeStorage)} de espaço livre, o que parece ser suficiente para este jogo.`
    : appDetails.size 
      ? `Você tem apenas ${formatBytes(deviceSpecs.freeStorage)} de espaço livre, insuficiente para este jogo (${appDetails.size}).`
      : `Você tem apenas ${formatBytes(deviceSpecs.freeStorage)} de espaço livre, o que pode ser insuficiente para este jogo.`;
  
  const memoryMessage = deviceSpecs.totalMemory > 0
    ? memoryCompatible
      ? `Seu dispositivo tem ${formatBytes(deviceSpecs.totalMemory)} de RAM, adequado para este jogo.`
      : `Seu dispositivo tem apenas ${formatBytes(deviceSpecs.totalMemory)} de RAM, o que pode limitar o desempenho.`
    : memoryCompatible
      ? `Seu dispositivo parece ter memória RAM suficiente para este jogo.`
      : `Seu dispositivo pode não ter memória RAM suficiente para este jogo.`;
  
  const processorMessage = deviceSpecs.cpuArchitecture && deviceSpecs.numberOfCores > 0
    ? processorCompatible
      ? `Seu processador (${deviceSpecs.cpuArchitecture}) com ${deviceSpecs.numberOfCores} núcleos é compatível.`
      : `Seu processador (${deviceSpecs.cpuArchitecture}) pode não ser compatível com este jogo.`
    : processorCompatible
      ? `Seu processador parece ser compatível com este jogo.`
      : `Seu processador pode não ser compatível com este jogo.`;
  
  const gpuMessage = deviceSpecs.model
    ? gpuCompatible === null
      ? `Não foi possível determinar a compatibilidade gráfica para o seu ${deviceSpecs.model}.`
      : gpuCompatible
        ? `Seu dispositivo (${deviceSpecs.model}) deve ser capaz de executar este jogo.`
        : `Seu dispositivo (${deviceSpecs.model}) pode ter dificuldades para executar este jogo.`
    : gpuCompatible === null
      ? `Não foi possível determinar a compatibilidade gráfica do seu dispositivo.`
      : gpuCompatible
        ? `Seu dispositivo deve ser capaz de executar este jogo.`
        : `Seu dispositivo pode ter dificuldades para executar este jogo.`;
  
  const screenMessage = deviceSpecs.screenWidth > 0 && deviceSpecs.screenHeight > 0
    ? screenCompatible
      ? `Sua tela (${deviceSpecs.screenWidth}x${deviceSpecs.screenHeight}) é adequada para este jogo.`
      : `Sua tela (${deviceSpecs.screenWidth}x${deviceSpecs.screenHeight}) pode não exibir este jogo adequadamente.`
    : screenCompatible
      ? `Sua tela parece ser adequada para este jogo.`
      : `Sua tela pode não exibir este jogo adequadamente.`;
  
  // Gerar mensagem geral
  let overallMessage = '';
  if (!isCompatible) {
    overallMessage = 'Seu dispositivo não atende aos requisitos mínimos para este jogo.';
  } else if (performanceLevel === 'high') {
    overallMessage = 'Seu dispositivo deve executar este jogo com alto desempenho.';
  } else if (performanceLevel === 'medium') {
    overallMessage = 'Seu dispositivo deve executar este jogo com desempenho adequado.';
  } else {
    overallMessage = 'Seu dispositivo atende aos requisitos mínimos, mas o desempenho pode ser limitado.';
  }
  
  return {
    isCompatible,
    performanceLevel,
    details: {
      android: {
        compatible: androidCompatible,
        deviceVersion: deviceSpecs.androidVersion,
        requiredVersion: appDetails.minAndroidVersion || 'N/A',
        message: androidMessage
      },
      storage: {
        compatible: storageCompatible,
        available: deviceSpecs.freeStorage,
        required: appSize,
        message: storageMessage
      },
      memory: {
        compatible: memoryCompatible,
        available: deviceSpecs.totalMemory,
        recommended: recommendedRam,
        message: memoryMessage
      },
      processor: {
        compatible: processorCompatible,
        architecture: deviceSpecs.cpuArchitecture,
        cores: deviceSpecs.numberOfCores,
        message: processorMessage
      },
      gpu: {
        compatible: gpuCompatible,
        message: gpuMessage
      },
      screen: {
        compatible: screenCompatible,
        resolution: `${deviceSpecs.screenWidth}x${deviceSpecs.screenHeight}`,
        density: deviceSpecs.screenDensity,
        message: screenMessage
      }
    },
    overallMessage
  };
}

// Função para gerar um relatório de compatibilidade com recomendações
export function generateCompatibilityReport(
  result: CompatibilityResult,
  appDetails: AppDetails
): string {
  const { isCompatible, performanceLevel, details } = result;
  
  let report = `## Relatório de Compatibilidade para ${appDetails.title}\n\n`;
  
  // Status geral
  report += `### Status: ${isCompatible ? '✅ Compatível' : '❌ Incompatível'}\n`;
  report += `### Desempenho esperado: ${
    performanceLevel === 'high' ? '🚀 Alto' : 
    performanceLevel === 'medium' ? '✓ Médio' : 
    '⚠️ Baixo'
  }\n\n`;
  
  // Detalhes por categoria
  report += `### Sistema Android\n`;
  report += `${details.android.compatible ? '✅' : '❌'} ${details.android.message}\n\n`;
  
  report += `### Armazenamento\n`;
  report += `${details.storage.compatible ? '✅' : '❌'} ${details.storage.message}\n\n`;
  
  report += `### Memória RAM\n`;
  report += `${details.memory.compatible ? '✅' : '❌'} ${details.memory.message}\n\n`;
  
  report += `### Processador\n`;
  report += `${details.processor.compatible ? '✅' : '❌'} ${details.processor.message}\n\n`;
  
  report += `### GPU/Gráficos\n`;
  report += `${details.gpu.compatible === null ? '❓' : details.gpu.compatible ? '✅' : '❌'} ${details.gpu.message}\n\n`;
  
  report += `### Tela\n`;
  report += `${details.screen.compatible ? '✅' : '❌'} ${details.screen.message}\n\n`;
  
  // Recomendações
  report += `### Recomendações\n`;
  
  if (!isCompatible) {
    report += `- Este jogo pode não funcionar adequadamente no seu dispositivo.\n`;
    
    if (!details.android.compatible) {
      report += `- Considere atualizar seu sistema Android para uma versão mais recente.\n`;
    }
    
    if (!details.storage.compatible) {
      report += `- Libere espaço no armazenamento do seu dispositivo antes de instalar.\n`;
    }
    
    if (!details.memory.compatible) {
      report += `- Feche outros aplicativos antes de jogar para liberar memória.\n`;
    }
  } else if (performanceLevel === 'low') {
    report += `- O jogo deve funcionar, mas você pode enfrentar lentidão ou travamentos.\n`;
    report += `- Recomendamos reduzir as configurações gráficas do jogo, se possível.\n`;
    report += `- Feche outros aplicativos antes de jogar para melhorar o desempenho.\n`;
  } else if (performanceLevel === 'medium') {
    report += `- O jogo deve funcionar bem com configurações gráficas médias.\n`;
    report += `- Para melhor experiência, feche outros aplicativos antes de jogar.\n`;
  } else {
    report += `- Seu dispositivo deve executar este jogo sem problemas, mesmo com configurações gráficas altas.\n`;
  }
  
  return report;
}
