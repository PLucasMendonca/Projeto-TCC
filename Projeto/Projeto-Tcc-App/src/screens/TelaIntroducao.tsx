import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { cores } from '../styles/cores';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TelaIntroducao'>;

export default function TelaIntroducao({ navigation }: Props) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    // Navegar para TelaLogin após 2.5 segundos
    const timer = setTimeout(() => {
      navigation.replace('TelaLogin');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={estilos.container}>
      <Animated.View
        style={[
          estilos.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/android/res/mipmap-xxxhdpi/ic_launcher.png')}
          style={estilos.logo}
        />
        <Text style={estilos.titulo}>GamerSlayer</Text>
        <Text style={estilos.subtitulo}>Lucas Mendonça</Text>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    marginBottom: 20,
  },
  titulo: {
    color: cores.secundaria,
    fontSize: 32,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitulo: {
    color: cores.secundaria,
    fontSize: 18,
    opacity: 0.8,
  },
});
