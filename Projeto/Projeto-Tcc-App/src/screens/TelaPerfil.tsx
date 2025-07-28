import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, SafeAreaView, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { cores } from '../styles/cores';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { recuperarSenha } from '../services/auth';

interface TelaPerfilProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TelaPerfil'>;
}

export default function TelaPerfil({ navigation }: TelaPerfilProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gamerLevel, setGamerLevel] = useState('Iniciante');
  
  useEffect(() => {
    // Carregar dados do usuário atual
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      setEmail(user.email || '');
      
      // Buscar dados adicionais do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData.username || '');
        setBio(userData.bio || '');
        setGamerLevel(userData.gamerLevel || 'Iniciante');
        console.log('Dados do usuário carregados do Firestore');
      } else {
        // Fallback para o displayName se não encontrar no Firestore
        setUsername(user.displayName || '');
        console.log('Documento do usuário não encontrado no Firestore');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Atualizar dados do usuário no Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        username: username,
        bio: bio,
        gamerLevel: gamerLevel,
        email: user.email,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    try {
      console.log('Iniciando processo de redefinição de senha');
      const user = auth.currentUser;
      if (!user || !user.email) {
        console.log('Usuário não autenticado ou sem email');
        Alert.alert('Erro', 'Não foi possível identificar seu email. Tente fazer login novamente.');
        return;
      }
      
      console.log('Email do usuário:', user.email);
      
      Alert.alert(
        'Trocar Senha',
        'Enviaremos um email com instruções para redefinir sua senha.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Enviar Email', 
            onPress: async () => {
              console.log('Botão Enviar Email pressionado');
              setLoading(true);
              try {
                console.log('Chamando função recuperarSenha com email:', user.email);
                const result = await recuperarSenha(user.email);
                console.log('Resultado da recuperação:', result);
                
                if (result.error) {
                  console.log('Erro na recuperação:', result.error);
                  Alert.alert('Erro', `Não foi possível enviar o email de redefinição de senha. (${result.error})`);
                } else {
                  console.log('Email enviado com sucesso');
                  Alert.alert(
                    'Email Enviado', 
                    'Verifique sua caixa de entrada para redefinir sua senha.'
                  );
                }
              } catch (error) {
                console.error('Exceção ao recuperar senha:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao tentar enviar o email.');
              } finally {
                setLoading(false);
              }
            } 
          }
        ]
      );
    } catch (error: any) {
      console.error('Exceção no handlePasswordReset:', error);
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={cores.secundaria} />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={cores.primaria} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : (

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              
              if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                setProfileImage(result.assets[0].uri);
              }
            }}>
              <View style={styles.profileImageWrapper}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={40} color={cores.secundaria} />
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={20} color={cores.primaria} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.levelBadge}>
            <FontAwesome5 name="gamepad" size={16} color={cores.secundaria} />
            <Text style={styles.levelText}>{gamerLevel}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.sectionTitle}>
            <MaterialIcons name="person" size={22} color={cores.primaria} />
            <Text style={styles.sectionTitleText}>Informações Pessoais</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome de usuário</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Seu nome de usuário"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              editable={false} // Email não pode ser editado
              placeholder="Seu email"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sobre mim</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Conte um pouco sobre você..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
          
          {/* Seção de configurações removida */}
          
          <View style={styles.sectionTitle}>
            <MaterialIcons name="security" size={22} color={cores.primaria} />
            <Text style={styles.sectionTitleText}>Segurança</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.securityButton}
            onPress={() => {
              console.log('Botão Alterar Senha pressionado');
              handlePasswordReset();
            }}
          >
            <MaterialIcons name="lock" size={22} color={cores.secundaria} />
            <Text style={styles.securityButtonText}>Alterar Senha</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleUpdateProfile}
          >
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: cores.primaria,
  },
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.primaria,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  levelText: {
    color: cores.secundaria,
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.primaria,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.primaria,
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: 'center',
  },
  securityButtonText: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: cores.secundaria,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: cores.secundaria,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: cores.primaria,
  },
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 70,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  form: {
    padding: 16,
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    color: cores.secundaria,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: cores.primaria,
    borderWidth: 1,
    borderColor: cores.secundaria,
    borderRadius: 8,
    padding: 10,
    color: cores.secundaria,
    fontSize: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  passwordButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: cores.secundaria,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  passwordButtonText: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: cores.secundaria,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  saveButtonText: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
