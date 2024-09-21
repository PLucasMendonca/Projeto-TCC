import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [gameName, setGameName] = useState('');
  const [phoneSpecs, setPhoneSpecs] = useState('');

  const checkCompatibility = () => {
    // Navega para a tela de resultados, passando os dados inseridos pelo usuário
    navigation.navigate('Result', { gameName, phoneSpecs });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Game Name</Text>
      <TextInput
        value={gameName}
        onChangeText={setGameName}
        placeholder="Enter the name of the game"
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Phone Specifications</Text>
      <TextInput
        value={phoneSpecs}
        onChangeText={setPhoneSpecs}
        placeholder="Enter phone specifications"
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Button title="Check Compatibility" onPress={checkCompatibility} />
    </View>
  );
}
