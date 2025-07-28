import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TelaInicial from '../screens/TelaInicial';
import TelaPerfil from '../screens/TelaPerfil';
import TelaHistorico from '../screens/TelaHistorico';
import TelaFeedback from '../screens/TelaFeedback';
import TelaDetalhesJogo from '../screens/TelaDetalhesJogo';

import TelaLogin from '../screens/TelaLogin';
import TelaCadastro from '../screens/TelaCadastro';
import TelaIntroducao from '../screens/TelaIntroducao';
import TelaResetSenha from '../screens/TelaResetSenha';
import TelaResultadosBusca from '../screens/TelaResultadosBusca';
import TelaCarregamentoComparacao from '../screens/TelaCarregamentoComparacao';
// TelaComparacao foi removida pois não é mais utilizada
import { cores } from '../styles/cores';
import { RootStackParamList } from '../types/navigation';
import { getCredenciaisSalvas, loginComEmail } from '../services/auth';
import { ActivityIndicator, View } from 'react-native';

const Navegador = createNativeStackNavigator<RootStackParamList>();

export default function NavegacaoApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('TelaIntroducao');

  useEffect(() => {
    const verificarCredenciais = async () => {
      try {
        const credenciais = await getCredenciaisSalvas();
        if (credenciais) {
          const { email, senha } = credenciais;
          const { error } = await loginComEmail({ email, senha }, true);
          if (!error) {
            setInitialRoute('TelaInicial');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar credenciais:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verificarCredenciais();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.primaria }}>
        <ActivityIndicator size="large" color={cores.secundaria} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Navegador.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: cores.primaria,
          },
          headerTintColor: cores.secundaria,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >

        <Navegador.Screen 
          name="TelaIntroducao" 
          component={TelaIntroducao} 
          options={{ 
            headerShown: false
          }}
        />
        <Navegador.Screen 
          name="TelaLogin" 
          component={TelaLogin} 
          options={{ 
            title: 'Login',
            headerShown: false
          }}
        />
        <Navegador.Screen 
          name="TelaCadastro" 
          component={TelaCadastro} 
          options={{ 
            title: 'Cadastro',
            headerShown: false
          }}
        />
        <Navegador.Screen 
          name="TelaInicial" 
          component={TelaInicial} 
          options={{ headerShown: false }}
        />
        <Navegador.Screen 
          name="TelaPerfil" 
          component={TelaPerfil} 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
        <Navegador.Screen 
          name="TelaHistorico" 
          component={TelaHistorico} 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
        <Navegador.Screen 
          name="TelaFeedback" 
          component={TelaFeedback} 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
        <Navegador.Screen 
          name="TelaDetalhesJogo" 
          component={TelaDetalhesJogo} 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
        <Navegador.Screen 
          name="TelaResultadosBusca" 
          component={TelaResultadosBusca} 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
        <Navegador.Screen 
          name="TelaCarregamentoComparacao" 
          component={TelaCarregamentoComparacao} 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
        {/* TelaComparacao foi removida pois não é mais utilizada */}
      </Navegador.Navigator>
    </NavigationContainer>
  );
}
