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
  if (version !== 20) {
    console.warn(`Version mismatch: expected 20, got ${version}`);
  }
  const packetNumber = view.getUint8(5);
  const playersPerTeam = view.getUint8(6);
  const competitionType = view.getUint8(7);
  const stopped = view.getUint8(8) !== 0;
  const gamePhase = getGamePhase(view.getUint8(9));
  const gameState = getGameState(view.getUint8(10));
  const setPlay = view.getUint8(11);
  const firstHalf = view.getUint8(12) !== 0;
  const kickingTeam = view.getUint8(13);
  
  // We use 'true' for little-endian (matches Python's default struct behavior)
  const secsRemaining = view.getInt16(14, true); 
  const secondaryTime = view.getInt16(16, true);

  const parsePlayer = (offset) => ({
    penalty: view.getUint8(offset),
    secsTillUnpenalized: view.getUint8(offset + 1),
    cautions: view.getUint8(offset + 2),
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
      team.players.push(parsePlayer(playersOffset + i * 3));
    }

    return team;
  };

  const team1 = parseTeam(18);
  const team2 = parseTeam(88);
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
  const pose_x = view.getFloat32(12,true);
  const pose_y = view.getFloat32(16,true);
  const pose_theta = view.getFloat32(20, true); 
  const ballAge    = view.getFloat32(24, true);
  const ball_x     = view.getFloat32(28, true);
  const ball_y     = view.getFloat32(32, true);
  const timestamp = Date.now();

  return {
    header,
    version,
    playerNum,
    teamNum,
    fallen,
    pose_x,
    pose_y,
    pose_theta,
    ballAge,
    ball_x,
    ball_y,
    timestamp
  };
};

// #define GAME_PHASE_NORMAL            0
// #define GAME_PHASE_PENALTY_SHOOT_OUT 1
// #define GAME_PHASE_EXTRA_TIME        2
// #define GAME_PHASE_TIMEOUT           3


export const getGamePhase = (id) => {

  const GamePhases = {0:"normal",1:"penalty shoot",2:"extra time",3:"timeout"}
  return(GamePhases[id])
}


// #define STATE_INITIAL  0
// #define STATE_READY    1
// #define STATE_SET      2
// #define STATE_PLAYING  3
// #define STATE_FINISHED 4

export const getGameState = (id) => {
  const GameStates = {0:"initial",1:"ready",2:"set",3:"playing",4:"finished"}
  return(GameStates[id])
}

export const getTeamName = (id) => {
  // TODO: maybe we should find a solution where we don't have to hardcode this
  const TeamNames = {
  0: "Invisibles",
  1: "NUbots",
  2: "Bold Hearts",
  3: "Bembelbots",
  4: "Berlin United",
  5: "B-Human",
  6: "Hamburg Bit-Bots",
  7: "Barelang FC",
  8: "whIRLwind Amsterdam",
  9: "WF Wolves",
  10: "Colmillos ITAM",
  11: "Rhoban",
  12: "Ruhrbot Devils",
  13: "Blenders FC",
  14: "HTWK Robots",
  15: "EWS Bascorro",
  16: "Pumas",
  17: "ZJUDancer",
  18: "rUNSWift",
  19: "SPQR Team",
  20: "GeoHBots",
  21: "RO:BIT",
  22: "HUST-HRT",
  23: "I-Kid",
  24: "HULKs",
  25: "HERoEHS",
  26: "ICHIRO ITS",
  27: "Invic",
  28: "Team Sweaty",
  29: "CAU Mountain&Sea",
  30: "THMOS",
  31: "Tsinghua Hephaestus",
  32: "UT AustinVilla",
  33: "NomadZ",
  34: "ITAndroids",
  35: "KHUBER",
  36: "Mountain",
  37: "Team noon",
  38: "WolverBot Kickers",
  39: "I-Teen",
  40: "Inha-United",
  41: "RFC-Tsudanuma",
  42: "RoboEireann",
  43: "Bahia Robotics Team",
  44: "Beihang RoboCup Team",
  45: "Naova",
  46: "BigHeroX",
  47: "DUT Future",
  48: "Future Becoming",
  49: "SABANA HERONS",
  50: "R-ZWEI KICKERS",
  51: "RedbackBots",
  52: "Badger Bots",
  53: "KURA",
  54: "PCMS-HRG",
  55: "Robo-Erectus",
  56: "RobôCIn",
  57: "Robotedge",
  58: "SJTU Cyber Shanhai",
  59: "Talos Humanoid Robots",
  60: "Tech United",
  61: "WarthogRobotics",
  62: "Water",
  63: "WHU United",
  64: "ZETIN",
  70: "B-Team"
}
  return(TeamNames[id])
}