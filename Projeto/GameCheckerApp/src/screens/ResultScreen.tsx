import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { checkGameCompatibility } from '../services/apiService';

export default function ResultScreen({ route }) {
  const { gameName, phoneSpecs } = route.params;
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchCompatibility = async () => {
      try {
        const result = await checkGameCompatibility(gameName, phoneSpecs);
        setIsCompatible(result.compatible);
      } catch (error) {
        console.error('Error fetching compatibility:', error);
      }
    };

    fetchCompatibility();
  }, [gameName, phoneSpecs]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Game: {gameName}</Text>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Phone Specs: {phoneSpecs}</Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Compatibility: {isCompatible === null ? 'Checking...' : isCompatible ? 'Yes' : 'No'}
      </Text>
    </View>
  );
}