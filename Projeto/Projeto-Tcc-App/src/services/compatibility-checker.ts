import { DeviceSpecs } from '../types/DeviceSpecs';
import { AppDetails } from './playstore-api';

export interface CompatibilityResult {
  isCompatible: boolean;
  reasons: {
    androidVersion: {
      compatible: boolean;
      recommended: string;
      current: string;
    };
    storage: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    ram: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    cpu: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    gpu: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    architecture: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    sensors: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    bluetooth: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    wifi: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    nfc: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    gps: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    camera: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    gyroscope: {
      compatible: boolean;
      recommended: string;
      available: string;
    };
    permissions: {
      compatible: boolean;
      missing: string[];
    };
  };
  score: number; // 0-100
  recommendations: string[];
}

function parseAndroidVersion(version: string): number {
  // Trata casos como "Varies with device" ou versões em formato texto
  if (!version || version.toLowerCase().includes('varies')) {
    return 0;
  }

  // Tenta extrair o número da versão (ex: "Android 5.0" -> 5.0)
  const match = version.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function formatBytes(bytes: number): string {
  // Verificar se o valor é válido
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes <= 0) {
    return 'Desconhecido';
  }
  
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
}

export function checkCompatibility(
  app: AppDetails,
  deviceSpecs: DeviceSpecs
): CompatibilityResult {
  // Inicializa o resultado
  const result: CompatibilityResult = {
    isCompatible: true,
    reasons: {
      androidVersion: {
        compatible: true,
        recommended: 'N/A',
        current: deviceSpecs.androidVersion || 'Unknown'
      },
      storage: {
        compatible: true,
        recommended: 'Unknown',
        available: formatBytes(deviceSpecs.availableStorage)
      },
      ram: {
        compatible: true,
        recommended: '2 GB',
        available: formatBytes(deviceSpecs.totalMemory)
      },
      cpu: {
        compatible: true,
        recommended: 'N/A',
        available: deviceSpecs.cpuArchitecture || 'Unknown'
      },
      gpu: {
        compatible: true,
        recommended: 'N/A',
        available: deviceSpecs.gpuModel || 'Unknown'
      },
      architecture: {
        compatible: true,
        recommended: 'N/A',
        available: deviceSpecs.cpuArchitecture || 'Unknown'
      },
      sensors: {
        compatible: true,
        recommended: 'N/A',
        available: 'Desconhecido'
      },
      bluetooth: {
        compatible: true,
        recommended: 'N/A',
        available: deviceSpecs.bluetoothVersion || 'Unknown'
      },
      wifi: {
        compatible: true,
        recommended: 'N/A',
        available: 'Desconhecido'
      },
      nfc: {
        compatible: true,
        recommended: 'N/A',
        available: deviceSpecs.hasNFC ? 'Sim' : 'Não'
      },
      gps: {
        compatible: true,
        recommended: 'N/A',
        available: deviceSpecs.hasGPS ? 'Sim' : 'Não'
      },
      camera: {
        compatible: true,
        recommended: 'N/A',
        available: deviceSpecs.hasCamera ? 'Sim' : 'Não'
      },
      gyroscope: {
        compatible: true,
        recommended: 'N/A',
        available: deviceSpecs.hasGyroscope ? 'Sim' : 'Não'
      },
      permissions: {
        compatible: true,
        missing: []
      }
    },
    score: 100,
    recommendations: []
  };

  // Verifica versão do Android
  const requiredAndroid = parseAndroidVersion(app.minAndroidVersion || '');
  const currentAndroid = parseAndroidVersion(deviceSpecs.androidVersion || '');
  
  if (requiredAndroid > 0 && currentAndroid > 0) {
    result.reasons.androidVersion.recommended = `Android ${requiredAndroid}`;
    result.reasons.androidVersion.compatible = currentAndroid >= requiredAndroid;
    
    if (!result.reasons.androidVersion.compatible) {
      result.isCompatible = false;
      result.score -= 40;
      result.recommendations.push(
        `Este app requer Android ${requiredAndroid} ou superior. Seu dispositivo tem Android ${currentAndroid}.`
      );
    }
  }

  // Verifica espaço em armazenamento
  // Assume que o app precisa de pelo menos 100MB + tamanho do app
  const minRequiredStorage = 100 * 1024 * 1024; // 100MB em bytes
  result.reasons.storage.recommended = formatBytes(minRequiredStorage);
  result.reasons.storage.compatible = deviceSpecs.availableStorage >= minRequiredStorage;

  if (!result.reasons.storage.compatible) {
    result.isCompatible = false;
    result.score -= 30;
    result.recommendations.push(
      `Espaço insuficiente. O app requer pelo menos ${formatBytes(minRequiredStorage)} de espaço livre.`
    );
  }

  // Verifica RAM (recomendação mínima de 2GB para jogos)
  const minRecommendedRam = 2 * 1024 * 1024 * 1024; // 2GB em bytes
  if (deviceSpecs.totalMemory < minRecommendedRam) {
    result.reasons.ram.compatible = false;
    result.score -= 15;
    result.recommendations.push(
      `Seu dispositivo tem ${formatBytes(deviceSpecs.totalMemory)} de RAM. Recomendamos pelo menos 2GB para melhor desempenho.`
    );
  }

  // Verifica permissões necessárias
  if (app.permissions && app.permissions.length > 0) {
    // Lista de permissões que o dispositivo não tem ou não pode fornecer
    const unsupportedPermissions = app.permissions.filter(permission => {
      // Aqui você pode adicionar lógica para verificar se o dispositivo suporta cada permissão
      // Por enquanto, vamos assumir que todas são suportadas
      return false;
    });

    if (unsupportedPermissions.length > 0) {
      result.reasons.permissions.compatible = false;
      result.reasons.permissions.missing = unsupportedPermissions;
      result.score -= 15;
      result.recommendations.push(
        `Seu dispositivo não suporta algumas permissões necessárias: ${unsupportedPermissions.join(', ')}`
      );
    }
  }

  // Ajusta o score final para estar entre 0 e 100
  result.score = Math.max(0, Math.min(100, result.score));

  return result;
}
