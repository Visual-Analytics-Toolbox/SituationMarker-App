import { useGameController } from '../utils/GameControllerContext';
import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity,Text } from 'react-native';
import { storeSituation } from '../utils/storeData';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

export default function AudioButton() {
  const { latestGameData,latestTrueGameData,latestRobotStatus} = useGameController();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    storeSituation(Date.now(),latestTrueGameData,latestGameData,latestRobotStatus,audioRecorder.uri);
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
 
    <TouchableOpacity style={styles.button} onPress={recorderState.isRecording ? stopRecording : record}>
        <Text style={styles.buttonText}>{recorderState.isRecording ? 'stop':'start'}</Text>
    </TouchableOpacity>
    
  );
}

const styles = StyleSheet.create({
   button: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#ec008c', alignItems: 'center', justifyContent: 'center',marginVertical:10},
    buttonText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
});
