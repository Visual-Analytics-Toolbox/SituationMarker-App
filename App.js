import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration, TextInput } from 'react-native';
import { GameControllerProvider } from './utils/GameControllerContext';
import MainView from './main';

export default function App() {





  return (
    <GameControllerProvider>
      <MainView></MainView>
    </GameControllerProvider>
  );
}

