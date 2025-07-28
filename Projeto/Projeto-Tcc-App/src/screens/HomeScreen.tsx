import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TelaInicial() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Bem-vindo ao TCC App</Text>
      <Text style={estilos.subtitulo}>Comece sua jornada aqui</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
  },
});
