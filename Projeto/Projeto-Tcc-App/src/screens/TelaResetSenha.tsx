import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../config/firebase';
import { cores } from '../styles/cores';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = {
  route: any;
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetSenha'>;
};

export default function TelaResetSenha({ route, navigation }: Props) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleResetSenha = async () => {
    try {
      if (novaSenha !== confirmarSenha) {
        setErro('As senhas não coincidem');
        return;
      }

      if (novaSenha.length < 6) {
        setErro('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      // Pegar o código da URL
      const oobCode = route.params?.oobCode;
      if (!oobCode) {
        setErro('Código de redefinição inválido');
        return;
      }

      await confirmPasswordReset(auth, oobCode, novaSenha);
      alert('Senha alterada com sucesso!');
      navigation.replace('TelaLogin');
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      setErro('Erro ao redefinir senha. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Redefinir Senha</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar nova senha"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity style={styles.botao} onPress={handleResetSenha}>
        <Text style={styles.botaoTexto}>Redefinir Senha</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: cores.fundo,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: cores.branco,
  },
  input: {
    backgroundColor: cores.secundaria,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    color: cores.branco,
  },
  erro: {
    color: '#ff4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: cores.primaria,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
