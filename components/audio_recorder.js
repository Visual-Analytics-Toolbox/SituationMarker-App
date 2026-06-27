import { useGameController } from '../utils/GameControllerContext';
import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Vibration } from 'react-native';
import { storeSituation } from '../utils/storeData';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

export default function AudioButton() {
  const { latestGameData, latestTrueGameData, latestRobotStatus } = useGameController();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    Vibration.vibrate(70);
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    Vibration.vibrate(70);
    await audioRecorder.stop();
    storeSituation(Date.now(), latestTrueGameData, latestGameData, latestRobotStatus, audioRecorder.uri);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (

    <View style={styles.container}>
      <Text style={styles.instructionText}>
        {recorderState.isRecording
          ? 'Recording Audio...'
          : 'Tap to Mark Situation & Record Audio'}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          recorderState.isRecording ? styles.buttonRecording : styles.buttonIdle
        ]}
        onPress={recorderState.isRecording ? stopRecording : record}
      >
        <Text style={styles.buttonText}>
          {recorderState.isRecording ? 'STOP' : 'REC'}
        </Text>
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  instructionText: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 15,
    fontWeight: '500',
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    // Adds a nice shadow to make it look like a physical button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonIdle: {
    backgroundColor: '#ec008c', // Your brand pink
  },
  buttonRecording: {
    backgroundColor: '#ff3b30', // iOS danger red
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Gives a cool glowing ring effect
  },
  buttonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold'
  },
});
