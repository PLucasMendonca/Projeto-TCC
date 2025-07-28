export interface DeviceSpecs {
  // Informações do Sistema
  androidVersion: string;
  apiLevel: number;
  brand: string;
  model: string;

  // Memória e Armazenamento
  totalMemory: number;
  availableStorage: number;
  freeStorage: number;

  // CPU e GPU
  cpuArchitecture: string;
  cpuCores?: number;
  cpuSpeed?: number;
  gpuModel?: string;
  gpuVendor?: string;

  // Tela
  screenWidth?: number;
  screenHeight?: number;
  refreshRate?: number;
  screenDensity?: number;

  // Performance
  benchmarkScore?: number;
  thermalInfo?: {
    maxTemp: number;
    currentTemp: number;
  };

  // Sensores
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasNFC: boolean;
  hasGPS: boolean;
  hasGyroscope: boolean;
  hasAccelerometer?: boolean;
  hasCompass?: boolean;
  hasBarometer?: boolean;
  hasProximitySensor?: boolean;
  hasLightSensor?: boolean;

  // Conectividade
  bluetoothVersion?: string;
  wifiStandards?: string[];
  hasCellular?: boolean;
  networkType?: string;
  networkSpeed?: number;
}
