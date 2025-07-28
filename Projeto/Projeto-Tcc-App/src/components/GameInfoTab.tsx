import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cores } from '../styles/cores';
import { DeviceSpecs } from '../types/DeviceSpecs';
import { AppDetails } from '../types/AppDetails';

interface Props {
  appDetails: AppDetails;
  deviceSpecs: DeviceSpecs;
  compatibility: {
    android: boolean;
    storage: boolean;
  };
}

export const GameInfoTab = ({ appDetails, deviceSpecs, compatibility }: Props) => {
  const renderComparisonItem = (title: string, deviceSpec: string | number, appRequirement: string | number, isCompatible: boolean) => (
    <View style={styles.comparisonItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{title}</Text>
        <View style={[styles.compatibilityIndicator, { backgroundColor: isCompatible ? cores.success : cores.error }]}>
          <Text style={styles.compatibilityText}>{isCompatible ? 'Compatível' : 'Incompatível'}</Text>
        </View>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.specText}>Seu dispositivo: {deviceSpec}</Text>
        <Text style={styles.requirementText}>Requisito: {appRequirement}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderComparisonItem(
        'Sistema Android',
        deviceSpecs.androidVersion || 'Desconhecido',
        appDetails.androidVersion || 'Não especificado',
        compatibility.android
      )}
      {renderComparisonItem(
        'Armazenamento',
        `${deviceSpecs.freeStorage.toFixed(1)} GB livre`,
        appDetails.size,
        compatibility.storage
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  comparisonItem: {
    backgroundColor: cores.surface,
    borderRadius: 8,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.text,
  },
  compatibilityIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  compatibilityText: {
    color: cores.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemDetails: {
    gap: 8,
  },
  specText: {
    fontSize: 16,
    color: cores.text,
  },
  requirementText: {
    fontSize: 16,
    color: cores.textSecondary,
  },
});
