import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { cores } from '../styles/cores';
import { Image } from 'react-native';

export function TelaCarregamento() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/loading-icon.png')}
        style={styles.icon}
      />
      <Text style={styles.text}>Aguarde um instante</Text>
      <ActivityIndicator 
        size="large" 
        color={cores.secundaria}
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  text: {
    color: cores.secundaria,
    fontSize: 18,
    marginBottom: 20,
  },
  spinner: {
    transform: [{ scale: 1.5 }]
  }
});
