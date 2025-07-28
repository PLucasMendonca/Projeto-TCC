import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { cores } from '../styles/cores';
import { cadastrarUsuario } from '../services/auth';

import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TelaCadastro'>;

export default function TelaCadastro({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [emailJaCadastrado, setEmailJaCadastrado] = useState(false);

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarSenha = (senha: string) => {
    return senha.length >= 6;
  };

  const validarUsername = (username: string) => {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const fazerCadastro = async () => {
    // Validar campos vazios
    if (!username || !email || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos');
      return;
    }

    // Validar formato do username
    if (!validarUsername(username)) {
      setErro('Nome de usuário deve ter entre 3 e 20 caracteres e conter apenas letras, números e _');
      return;
    }

    // Validar formato do email
    if (!validarEmail(email)) {
      setErro('Digite um email válido');
      return;
    }

    // Validar tamanho da senha
    if (!validarSenha(senha)) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Validar se as senhas conferem
    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem');
      return;
    }

    try {
      setLoading(true);
      setErro('');
      setEmailJaCadastrado(false);
      
      const { user, error } = await cadastrarUsuario({ email, senha, username });
      
      if (error) {
        // Traduzir erros comuns do Firebase
        switch(error) {
          case 'auth/email-already-in-use':
            setErro('Este email já está cadastrado');
            setEmailJaCadastrado(true);
            break;
          case 'auth/invalid-email':
            setErro('Email inválido');
            break;
          case 'auth/operation-not-allowed':
            setErro('Operação não permitida');
            break;
          case 'auth/weak-password':
            setErro('Senha muito fraca');
            break;
          default:
            setErro(error);
        }
        return;
      }

      if (user) {
        navigation.replace('TelaLogin');
      }
    } catch (error) {
      setErro('Erro ao criar conta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={estilos.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={estilos.content}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={estilos.backButton}
        >
          <Text style={estilos.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={estilos.logoContainer}>
          <Image
            source={require('../../assets/android/res/mipmap-xxxhdpi/ic_launcher.png')}
            style={estilos.logo}
          />
          <Text style={estilos.titulo}>GamerSlayer</Text>
        </View>

        <View style={estilos.cardContainer}>
          <View style={estilos.card}>
            <Text style={estilos.cardTitulo}>Criar Conta</Text>

            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Username</Text>
              <TextInput
                style={estilos.input}
                placeholder="Digite seu nick..."
                placeholderTextColor={cores.destaque}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Email</Text>
              <TextInput
                style={estilos.input}
                placeholder="Digite seu Email..."
                placeholderTextColor={cores.destaque}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Senha</Text>
              <TextInput
                style={estilos.input}
                placeholder="Digite sua senha..."
                placeholderTextColor={cores.destaque}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>

            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Confirme sua senha</Text>
              <TextInput
                style={estilos.input}
                placeholder="Confirme sua senha..."
                placeholderTextColor={cores.destaque}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />
            </View>

            {erro ? (
              <View style={estilos.erroContainer}>
                <Text style={estilos.erro}>{erro}</Text>
                {emailJaCadastrado && (
                  <TouchableOpacity onPress={() => navigation.navigate('TelaLogin')}>
                    <Text style={estilos.loginLink}>Ir para o login</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            <TouchableOpacity 
              style={[estilos.botaoCadastro, loading && estilos.botaoDesabilitado]}
              onPress={fazerCadastro}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={cores.secundaria} />
              ) : (
                <Text style={estilos.botaoCadastroTexto}>Cadastre-se</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
  },
  content: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    position: 'absolute',
    top: 40,
    left: 0,
    zIndex: 1,
  },
  backButtonText: {
    color: cores.secundaria,
    fontSize: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '25%',
    paddingTop: 40,
  },
  titulo: {
    color: cores.secundaria,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: cores.secundaria,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitulo: {
    color: cores.primaria,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    color: cores.primaria,
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: cores.secundaria,
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 25,
    fontSize: 14,
    color: cores.fundo,
    borderWidth: 1,
    borderColor: cores.primaria,
  },
  botaoCadastro: {
    backgroundColor: cores.primaria,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  botaoCadastroTexto: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  erroContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  erro: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
  },
  loginLink: {
    color: cores.primaria,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
});