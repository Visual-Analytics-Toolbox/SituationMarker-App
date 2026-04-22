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
  if (version !== 19) {
    // Note: Python code says 18, check if your sender matches
    console.warn(`Version mismatch: expected 19, got ${version}`);
  }

  // 3. Parse fields based on byte offsets
  // Offset 5: packetNumber (B)
  // Offset 6: playersPerTeam (B)
  // Offset 7: competitionType (B)
  // Offset 8: stopped (B)
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

// 4s header
// B version
// B playerNum
// B teamNum
// B fallen
// f pose x
// f pose y
// f pose theta
// f ballAge
// f ball x
// f ball y

export const parseGameControlReturnData = (data) => {
  // Convert to DataView for easy offset-based reading
  // If data is a string, you'll need to convert it to a Uint8Array first
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  
  // 1. Check Header (First 4 bytes)
  const header = String.fromCharCode(
    view.getUint8(4), view.getUint8(5), view.getUint8(6), view.getUint8(7)
  );

  if (header !== 'RGrt') {
    throw new Error(`Invalid Header: ${header}`);
  }

  // 2. Check Version (Byte 4)
  const version = view.getUint8(8);
  if (version !== 4) {
    console.warn(`Version mismatch: expected 4, got ${version}`);
  }

  // Offset 5: playerNum (B)
  // Offset 6: teamNum (B)
  // Offset 7: fallen (B)
 // each f is 4 bytes long

  return {
    header,
    version,
  };
};