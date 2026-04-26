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
    console.warn(`Version mismatch: expected 19, got ${version}`);
  }
  const packetNumber = view.getUint8(5);
  const playersPerTeam = view.getUint8(6);
  const competitionType = view.getUint8(7);
  const stopped = view.getUint8(8) !== 0;
  const gamePhase = view.getUint8(9);
  const gameState = view.getUint8(10);
  const setPlay = view.getUint8(11);
  const firstHalf = view.getUint8(12) !== 0;
  const kickingTeam = view.getUint8(13);
  
  // We use 'true' for little-endian (matches Python's default struct behavior)
  const secsRemaining = view.getInt16(14, true); 
  const secondaryTime = view.getInt16(16, true);

  const parsePlayer = (offset) => ({
    penalty: view.getUint8(offset),
    secsTillUnpenalized: view.getUint8(offset + 1),
    warnings: view.getUint8(offset + 2),
    cautions: view.getUint8(offset + 3),
  });

  const parseTeam = (offset) => {
    const team = {
      teamNumber: view.getUint8(offset),
      fieldPlayerColor: view.getUint8(offset + 1),
      goalkeeperColor: view.getUint8(offset + 2),
      goalkeeper: view.getUint8(offset + 3),
      score: view.getUint8(offset + 4),
      penaltyShot: view.getUint8(offset + 5),
      singleShots: view.getUint16(offset + 6, true),
      messageBudget: view.getUint16(offset + 8, true),
      players: [],
    };
    // Do we need to store player info ?
    const playersOffset = offset + 10;
    for (let i = 0; i < playersPerTeam; i += 1) {
      team.players.push(parsePlayer(playersOffset + i * 4));
    }

    return team;
  };

  const team1 = parseTeam(18);
  const team2 = parseTeam(108);
  const timestamp = Date.now();

  return {
    header,
    version,
    packetNumber,
    playersPerTeam,
    competitionType,
    stopped,
    gamePhase,
    gameState,
    setPlay,
    firstHalf,
    kickingTeam,
    secsRemaining,
    secondaryTime,
    team1,
    team2,
    timestamp,
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
  const playerNum = view.getUint8(9);
  const teamNum = view.getUint8(10);
  const fallen = view.getUint8(11);
  const pose_x = view.getFloat32(12);
  const pose_y = view.getFloat32(16);
  const ballAge = view.getFloat32(20);
  const ball_x = view.getFloat32(24);
  const ball_y = view.getFloat32(28);
  const timestamp = Date.now();

  return {
    header,
    version,
    playerNum,
    teamNum,
    fallen,
    pose_x,
    pose_y,
    ballAge,
    ball_x,
    ball_y,
    timestamp
  };
};