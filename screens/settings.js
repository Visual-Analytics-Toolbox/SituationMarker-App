import { StyleSheet, Text, View, TouchableOpacity, Vibration, TextInput } from 'react-native';
import { useState, useEffect, useRef } from 'react';



export default function Settings() {

    return (
        <View style={styles.container}>
            <Text style={styles.status}>Token</Text>
            <TextInput style={styles.ipInput}>
                Token
            </TextInput>
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