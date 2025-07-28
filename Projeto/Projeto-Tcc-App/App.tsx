import React from 'react';
import { StatusBar } from 'expo-status-bar';
import NavegacaoApp from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavegacaoApp />
    </>
  );
}
