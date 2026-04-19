import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration, TextInput } from 'react-native';
import UdpSocket from 'react-native-udp';
import { Buffer } from 'buffer';
import { parseGameControlData } from './utils/GameControlData';


export default function App() {
  const [gameTime, setGameTime] = useState("Disconnected");
  const [gcIP,setGcIP] = useState('10.0.2.2');
  const socketRef = useRef(null);


  const SEND_PORT = 3636;
  const LISTEN_PORT = 3838;

  useEffect(() => {
    // 1. Create the Socket
    const socket = UdpSocket.createSocket('udp4');
    
    socket.on('message', (data, rinfo) => {
      // data is a Buffer
      const header = data.toString('ascii', 0, 4);
      const gameData = parseGameControlData(data);

      if (gameData.header === 'RGTD') {
        console.log(gameData)
        // Simple extraction: Assuming secsRemaining is at a specific byte offset
        // You will eventually need a proper parser here
        const minutes = Math.floor(gameData.secsRemaining / 60);
        const seconds = gameData.secsRemaining % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`;
        //setGameTime(`${gameData.secsRemaining}s remaining`);
        setGameTime(formattedTime);
      }
    });

    socket.on('error', (err) => {
      console.log('Socket Error:', err);
    });

    socket.bind(LISTEN_PORT);
    socketRef.current = socket;

    return () => socket.close();
  }, []);

  const sendHandshake = () => {
    if (!socketRef.current) return;

    // RGTr + Version 0 (5 bytes)
    const packet = Buffer.concat([
      Buffer.from('RGTr', 'ascii'),
      Buffer.from([0])
    ]);

    socketRef.current.send(
      packet,
      0,
      packet.length,
      SEND_PORT,
      gcIP,
      (err) => {
        if (err) console.log("Send Error:", err);
        else console.log("Handshake sent to", gcIP);
      }
    );
  };

  const handleMark = () => {
    Vibration.vibrate(70);
    // Here you would call your API to save the situation
    console.log("Marked at:", gameTime);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>Gamecontroller IP</Text>
      <TextInput style={styles.ipInput} onChangeText={setGcIP}>
        {gcIP}
      </TextInput>
      <TouchableOpacity onPress={sendHandshake} style={styles.connectBtn}>
        <Text style={styles.connectText}>CONNECT TO GAME</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleMark}>
        <Text style={styles.buttonText}>MARK</Text>
      </TouchableOpacity>

      <Text style={styles.status}>{gameTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' },
  button: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#ec008c', alignItems: 'center', justifyContent: 'center', marginVertical: 40 },
  buttonText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  connectBtn: { padding: 10, backgroundColor: '#333', borderRadius: 5 },
  connectText: { color: '#00ff00', fontWeight: 'bold' },
  status: { color: '#aaa', fontSize: 20 },
  ipInput: { padding: 10, backgroundColor: '#333', borderRadius: 5,color: '#00ff00', fontWeight: 'bold' ,width:110,textAlign:'center'}
});