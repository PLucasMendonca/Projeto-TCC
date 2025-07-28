import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ViewStyle,
  ImageStyle,
  TextStyle,
  Animated,
  Easing,
} from 'react-native';
import { cores } from '../styles/cores';

interface TelaCarregamentoBaseProps {
  mensagem: string;
  icone?: string;
  animado?: boolean;
}

const TelaCarregamentoBase: React.FC<TelaCarregamentoBaseProps> = ({
  mensagem,
  icone,
  animado = false,
}) => {
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    if (animado) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animado]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const IconeContainer = animado ? Animated.View : View;
  const iconContainerStyle = animado ? { transform: [{ rotate: spin }] } : {};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <IconeContainer style={[styles.iconContainer, iconContainerStyle]}>
          {icone ? (
            <Image
              source={{ uri: icone }}
              style={styles.icon}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../../assets/android/res/mipmap-xxxhdpi/ic_launcher.png')}
              style={styles.icon}
            />
          )}
        </IconeContainer>

        <Text style={styles.mensagem}>{mensagem}</Text>

        <ActivityIndicator
          size="large"
          color={cores.secundaria}
          style={styles.loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  mensagem: {
    color: cores.secundaria,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  loading: {
    marginTop: 20,
  },
});

export default TelaCarregamentoBase;
