import * as Device from 'expo-device';
import * as Application from 'expo-application';

export interface DeviceSpecs {
  totalStorage: number;
  freeStorage: number;
  androidVersion: string;
  deviceModel: string;
  deviceName: string;
}

export async function getDeviceSpecs(): Promise<DeviceSpecs> {
  const deviceModel = Device.modelName || 'Unknown';
  const deviceName = Device.deviceName || 'Unknown Device';
  const androidVersion = Device.osVersion || 'Unknown';
  
  // Mock values for storage since we can't get real values in Expo
  const totalStorage = 64; // GB
  const freeStorage = 32; // GB

  return {
    totalStorage,
    freeStorage,
    androidVersion,
    deviceModel,
    deviceName
  };
}
