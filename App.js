import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration } from 'react-native';
import UdpSocket from 'react-native-udp';
import { Buffer } from 'buffer';

// Mapping the struct format: '4s B B B B B B B B B B h h'
// 4s = 4 bytes (string/header)
// B  = 1 byte (unsigned char)
// h  = 2 bytes (short / signed 16-bit integer)

export const parseGameControlData = (data) => {
  // Convert to DataView for easy offset-based reading
  // If data is a string, you'll need to convert it to a Uint8Array first
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  
  // 1. Check Header (First 4 bytes)
  const header = String.fromCharCode(
    view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)
  );

  if (header !== 'RGme' && header !== 'RGTD') {
    throw new Error(`Invalid Header: ${header}`);
  }

  // 2. Check Version (Byte 4)
  const version = view.getUint8(4);
  if (version !== 18) {
    // Note: Python code says 18, check if your sender matches
    console.warn(`Version mismatch: expected 18, got ${version}`);
  }

  // 3. Parse fields based on byte offsets
  // Offset 5: packetNumber (B)
  // Offset 6: playersPerTeam (B)
  // Offset 7: competitionPhase (B)
  // Offset 8: competitionType (B)
  // Offset 9: gamePhase (B)
  // Offset 10: gameState (B)
  // Offset 11: setPlay (B)
  // Offset 12: firstHalf (B)
  // Offset 13: kickingTeam (B)
  
  // The 'h' (short) fields start at offset 14
  // We use 'true' for little-endian (matches Python's default struct behavior)
  const secsRemaining = view.getInt16(14, true); 
  const secondaryTime = view.getInt16(16, true);

  return {
    header,
    version,
    gameState: view.getUint8(10),
    secsRemaining, // This is what you're after!
    secondaryTime, // This one too!
  };
};

export default function App() {
  const [gameTime, setGameTime] = useState("Disconnected");
  const socketRef = useRef(null);

  // Configuration - Change this to your PC's IP address!
  const PC_IP = '10.0.4.100'; 
  const SEND_PORT = 3636;
  const LISTEN_PORT = 3838;

  useEffect(() => {
    // 1. Create the Socket
    const socket = UdpSocket.createSocket('udp4');
    
    socket.on('message', (data, rinfo) => {
      // data is a Buffer
      const header = data.toString('ascii', 0, 4);
      const gameData = parseGameControlData(data);

      if (gameData.header === 'RGme') {
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
      PC_IP,
      (err) => {
        if (err) console.log("Send Error:", err);
        else console.log("Handshake sent to", PC_IP);
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
  button: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#e91e63', alignItems: 'center', justifyContent: 'center', marginVertical: 40 },
  buttonText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  connectBtn: { padding: 10, backgroundColor: '#333', borderRadius: 5 },
  connectText: { color: '#00ff00', fontWeight: 'bold' },
  status: { color: '#aaa', fontSize: 20 }
});