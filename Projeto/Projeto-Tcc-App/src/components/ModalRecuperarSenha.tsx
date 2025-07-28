import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { cores } from '../styles/cores';
import { recuperarSenha } from '../services/auth';

type Props = {
  visivel: boolean;
  onFechar: () => void;
};

export default function ModalRecuperarSenha({ visivel, onFechar }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEnviar = async () => {
    console.log('Iniciando processo de recuperação para:', email);

    if (!email) {
      console.log('Email vazio');
      setErro('Digite seu email');
      return;
    }

    if (!validarEmail(email)) {
      console.log('Email inválido:', email);
      setErro('Digite um email válido');
      return;
    }

    try {
      setLoading(true);
      setErro('');
      
      console.log('Chamando serviço de recuperação...');
      const { error } = await recuperarSenha(email);
      
      console.log('Resposta do serviço:', error);
      
      if (error) {
        console.log('Erro detectado:', error);
        switch(error) {
          case 'auth/user-not-found':
            setErro('Email não cadastrado no sistema');
            return;
          case 'auth/invalid-email':
            setErro('Formato de email inválido');
            return;
          case 'auth/missing-email':
            setErro('Digite seu email');
            return;
          case 'auth/network-request-failed':
            setErro('Erro de conexão. Verifique sua internet.');
            return;
          case 'auth/too-many-requests':
            setErro('Muitas tentativas. Tente novamente mais tarde.');
            return;
          default:
            setErro('Erro ao enviar email. Tente novamente.');
            console.error('Erro Firebase:', error);
            return;
        }
      }

      setSucesso(true);
    } catch (error) {
      setErro('Erro ao enviar email');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFechar = () => {
    setEmail('');
    setErro('');
    setSucesso(false);
    onFechar();
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={handleFechar}
    >
      <View style={estilos.fundo}>
        <View style={estilos.modal}>
          <Text style={estilos.titulo}>Recuperar Senha</Text>
          
          {sucesso ? (
            <>
              <Text style={estilos.mensagemSucesso}>
                Email enviado com sucesso! Verifique sua caixa de entrada e a pasta de spam.
                Se não receber em alguns minutos, tente novamente.
              </Text>
              <TouchableOpacity
                style={estilos.botao}
                onPress={handleFechar}
              >
                <Text style={estilos.botaoTexto}>Fechar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={estilos.descricao}>
                Digite seu email para receber o link de recuperação de senha
              </Text>

              <TextInput
                style={estilos.input}
                placeholder="Seu email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

              <TouchableOpacity
                style={[estilos.botao, loading && estilos.botaoDesabilitado]}
                onPress={handleEnviar}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={cores.secundaria} />
                ) : (
                  <Text style={estilos.botaoTexto}>Enviar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={estilos.botaoCancelar}
                onPress={handleFechar}
              >
                <Text style={estilos.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: cores.secundaria,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.primaria,
    textAlign: 'center',
    marginBottom: 15,
  },
  descricao: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  erro: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  mensagemSucesso: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: cores.primaria,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  botaoTexto: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  botaoCancelar: {
    marginTop: 10,
    padding: 10,
  },
  botaoCancelarTexto: {
    color: '#666',
    textAlign: 'center',
  },
});
