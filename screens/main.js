import { useGameController } from '../utils/GameControllerContext';
import { StyleSheet, Text, View, TouchableOpacity, Vibration, TextInput } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { storeSituation } from '../utils/storeData';
import AudioButton from '../components/audio_recorder';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatTime = (secsRemaining) => {
    const minutes = Math.floor(secsRemaining / 60);
    const seconds = secsRemaining % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`;
    return formattedTime;
}

export default function Main() {
    const { gcIP, monitor, latestGameData, latestTrueGameData, latestRobotStatus } = useGameController();
    // const [gcIP,setGcIP] = useState('10.12.156.98');

    const handleMark = () => {
        Vibration.vibrate(70);
        storeSituation(Date.now(), latestTrueGameData, latestGameData, latestRobotStatus);
    };

    return (
        <View style={styles.container}>
            {/* TOP: Game Info */}
            <View style={styles.header}>
                <Text style={styles.statusLabel}>GameController IP</Text>
                <Text style={styles.ipText}>
                    {gcIP === '' ? 'Not connected' : gcIP}
                </Text>
                <Text style={styles.timeText}>
                    {formatTime(latestTrueGameData?.secsRemaining)}
                </Text>
            </View>

            {/* BOTTOM: Actions */}
            <View style={styles.actionArea}>
                <TouchableOpacity style={styles.markButton} onPress={handleMark}>
                    <Text style={styles.markButtonText}>Quick Mark (No Audio)</Text>
                </TouchableOpacity>

                <AudioButton />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'space-between', // Pushes header up and actions down
        paddingVertical: 60,
        paddingHorizontal: 20
    },
    header: {
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        padding: 20,
        borderRadius: 15,
    },
    statusLabel: { color: '#aaa', fontSize: 16, marginBottom: 5 },
    ipText: { color: '#00ff00', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    timeText: { color: '#fff', fontSize: 36, fontWeight: 'bold', textAlign: 'center' },

    actionArea: {
        alignItems: 'center',
        gap: 30, // Adds space between the two buttons
    },
    markButton: {
        width: '100%',
        paddingVertical: 20,
        borderRadius: 15,
        backgroundColor: '#333', // Dark grey instead of pink
        borderWidth: 2,
        borderColor: '#ec008c', // Pink border keeps it on-brand but secondary
        alignItems: 'center',
    },
    markButtonText: { color: '#ec008c', fontSize: 20, fontWeight: 'bold' },
});