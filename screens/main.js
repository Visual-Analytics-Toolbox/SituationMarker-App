import { useGameController } from '../utils/GameControllerContext';
import { StyleSheet, Text, View, TouchableOpacity, Vibration, TextInput } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { storeSituation } from '../utils/storeData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatTime = (secsRemaining) => {
         const minutes = Math.floor(secsRemaining / 60);
        const seconds = secsRemaining % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`;
        return formattedTime;
}

export default function Main() {
    const { gcIP, monitor,latestGameData,latestTrueGameData,latestRobotStatus} = useGameController();
    // const [gcIP,setGcIP] = useState('10.12.156.98');

      const handleMark = () => {
        Vibration.vibrate(70);
        storeSituation(Date.now(),latestTrueGameData,latestGameData,latestRobotStatus);
      };

    return (
        <View style={styles.container}>
            <Text style={styles.status}>Gamecontroller IP</Text>
            <TextInput style={styles.ipInput}>
                {gcIP}
            </TextInput>
            {/* <TouchableOpacity onPress={sendHandshake} style={styles.connectBtn}>

                <Text style={styles.connectText}>CONNECT TO GAME</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.button} onPress={handleMark}>
                <Text style={styles.buttonText}>MARK</Text>
            </TouchableOpacity>

            <Text style={styles.status}>{formatTime(latestTrueGameData?.secsRemaining)}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' },
    button: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#ec008c', alignItems: 'center', justifyContent: 'center', marginVertical: 40 },
    buttonText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    connectBtn: { padding: 10, backgroundColor: '#333', borderRadius: 5 },
    connectText: { color: '#00ff00', fontWeight: 'bold' },
    status: { color: '#aaa', fontSize: 20 },
    ipInput: { padding: 10, backgroundColor: '#333', borderRadius: 5, color: '#00ff00', fontWeight: 'bold', width: 110, textAlign: 'center' }
});