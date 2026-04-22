import { Buffer } from 'buffer';
export const sendHandshake = (gcIP,socketRef) => {
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
      3636,
      gcIP,
      (err) => {
        if (err) console.log("Send Error:", err);
        else console.log("Handshake sent to", gcIP);
      }
    );
  };