import { StyleSheet, Text, View, TouchableOpacity, Vibration, TextInput, Linking } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useToken } from '../utils/auth';

export default function Settings() {
    const [token,setValue] = useToken();
    return (
        <View style={styles.container}>
            <Text style={styles.status}>Token</Text>
            <TextInput 
            style={styles.ipInput}
            value={token}
        onChangeText={setValue}
            />

            <View style={styles.tokenInfo}> <Text style={styles.status}>Tokens can be obtained from  </Text>
                <Text style={styles.link} onPress={() => Linking.openURL('https://vat.berlin-united.com/admin')}>
                    https://vat.berlin-united.com/admin
                </Text>
                <Text style={styles.status}>
                If you can't obtain a token, marked Sitations are only stored locally.
            </Text></View>
           
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' },
    button: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#ec008c', alignItems: 'center', justifyContent: 'center', marginVertical: 40 },
    buttonText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    connectBtn: { padding: 10, backgroundColor: '#333', borderRadius: 5 },
    connectText: { color: '#00ff00', fontWeight: 'bold' },
    status: { color: '#aaa', fontSize: 20 ,textAlign: 'center'},
    ipInput: { padding: 10, backgroundColor: '#333', borderRadius: 5, color: '#00ff00', fontWeight: 'bold', width: 210, textAlign: 'center' },
    tokenInfo: { padding: 30,},
    link: {color:'#ec008c',fontSize:20,textAlign:'center'}
});