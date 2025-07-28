import React, { useState, useCallback } from 'react';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import * as SplashScreen from 'expo-splash-screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import ModalRecuperarSenha from '../components/ModalRecuperarSenha';
import { loginComEmail } from '../services/auth';
import { cores } from '../styles/cores';

import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TelaLogin'>;

export default function TelaLogin({ navigation }: Props) {
  // Font loading hooks
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  // State hooks
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [modalRecuperarSenhaVisivel, setModalRecuperarSenhaVisivel] = useState(false);
  const [manterConectado, setManterConectado] = useState(false);

  // Effect and callback hooks
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const fazerLogin = async () => {
    // Validar campos vazios
    if (!email || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    // Validar formato do email
    if (!validarEmail(email)) {
      setErro('Digite um email válido');
      return;
    }

    try {
      setLoading(true);
      setErro('');
      
      const { user, error } = await loginComEmail({ email, senha }, manterConectado);
      
      if (error) {
        // Traduzir erros comuns do Firebase
        switch(error) {
          case 'auth/user-not-found':
            setErro('Usuário não encontrado');
            break;
          case 'auth/wrong-password':
            setErro('Senha incorreta');
            break;
          case 'auth/invalid-email':
            setErro('Email inválido');
            break;
          case 'auth/user-disabled':
            setErro('Usuário desativado');
            break;
          case 'auth/too-many-requests':
            setErro('Muitas tentativas. Tente novamente mais tarde');
            break;
          default:
            setErro(error);
        }
        return;
      }

      if (user) {
        navigation.replace('TelaInicial');
      }
    } catch (error) {
      setErro('Erro ao fazer login');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const irParaCadastro = () => {
    navigation.navigate('TelaCadastro');
  };

  return (
    <SafeAreaView style={estilos.container} onLayout={onLayoutRootView}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={estilos.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      >
        <View style={estilos.logoContainer}>
          <Image
            source={require('../../assets/android/res/mipmap-xxxhdpi/ic_launcher.png')}
            style={estilos.logo}
          />
          <Text style={estilos.titulo}>GamerSlayer</Text>
        </View>

        <View style={estilos.cardContainer}>
          <View style={estilos.card}>
            <View style={estilos.inputWrapper}>
              <Text style={estilos.label}>Login</Text>
              <TextInput
                style={estilos.input}
                placeholder="Digite seu email..."
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

            <View style={estilos.checkboxContainer}>
              <TouchableOpacity 
                style={[estilos.checkbox, manterConectado && estilos.checkboxMarcado]}
                onPress={() => setManterConectado(!manterConectado)}
              >
                {manterConectado && (
                  <View style={estilos.checkboxInner} />
                )}
              </TouchableOpacity>
              <Text style={estilos.checkboxLabel}>Manter conectado</Text>
              <TouchableOpacity onPress={() => setModalRecuperarSenhaVisivel(true)}>
                <Text style={estilos.esqueciSenhaTexto}>Esqueci a senha</Text>
              </TouchableOpacity>
              <ModalRecuperarSenha
                visivel={modalRecuperarSenhaVisivel}
                onFechar={() => setModalRecuperarSenhaVisivel(false)}
              />
            </View>

            {erro ? (
              <Text style={estilos.erro}>{erro}</Text>
            ) : null}

            <TouchableOpacity 
              style={[estilos.botaoLogin, loading && estilos.botaoDesabilitado]}
              onPress={fazerLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={cores.secundaria} />
              ) : (
                <Text style={estilos.botaoLoginTexto}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={estilos.botaoCadastro} onPress={irParaCadastro}>
              <Text style={estilos.botaoCadastroTexto}>Cadastre-se</Text>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  titulo: {
    color: cores.secundaria,
    fontSize: 28,
    marginTop: 30,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontFamily: 'PressStart2P_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: cores.secundaria,
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
    marginBottom: 15,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: cores.primaria,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxMarcado: {
    backgroundColor: cores.primaria,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: cores.secundaria,
    borderRadius: 2,
  },
  checkboxLabel: {
    color: cores.primaria,
    flex: 1,
  },
  esqueciSenha: {
    marginLeft: 'auto',
  },
  esqueciSenhaTexto: {
    color: cores.destaque,
  },
  erro: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  botaoLogin: {
    backgroundColor: cores.primaria,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoLoginTexto: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoCadastro: {
    marginTop: 10,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cores.primaria,
  },
  botaoCadastroTexto: {
    color: cores.secundaria,
    fontSize: 14,
    fontWeight: 'bold',
  },
  botaoGoogle: {
    flex: 1,
    marginLeft: 10,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cores.complementar,
  },
  botaoGoogleTexto: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
});