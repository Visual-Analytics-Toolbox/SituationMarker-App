import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration } from 'react-native';

export default function App() {
  const [lastMark, setLastMark] = useState("No mark yet");

  const handlePress = () => {
    // 1. Get current timestamp (or game time later)
    const timestamp = new Date().toLocaleTimeString();
    setLastMark(timestamp);

    // 2. Give haptic feedback (vibrate) so you know it clicked
    Vibration.vibrate(100);

    // 3. Logic for UDP will go here later!
    console.log("Button Pressed at:", timestamp);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Situation Marker</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>MARK</Text>
      </TouchableOpacity>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Last Marker:</Text>
        <Text style={styles.statusValue}>{lastMark}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark mode
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100, // Makes it a circle
    backgroundColor: '#e91e63', // Bright pink/red
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10, // Shadow for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  statusLabel: {
    color: '#888',
    fontSize: 14,
  },
  statusValue: {
    color: '#00ff00', // Green for the time
    fontSize: 18,
    marginTop: 5,
  },
});