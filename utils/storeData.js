import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export async function storeSituation(Timestamp, TrueGameData, GameData, RobotStatus,audio=null) {
    const n_date = new Date(TrueGameData.timestamp);
    const month = String(n_date.getMonth() + 1).padStart(2, '0');
    const day = String(n_date.getDate()).padStart(2, '0');
    const key = `${n_date.getFullYear()}_${month}_${day}_${TrueGameData.team1.teamNumber}_vs_${TrueGameData.team2.teamNumber}`;
    console.log(month);
    
    let situation = {
        "uuid": Crypto.randomUUID(),
        "timestamp": Timestamp,
        "TrueGameData": TrueGameData,
        "GameData": GameData,
        "RobotStatus": RobotStatus
    }

    if (audio) {
        situation["audio"] = audio;
    }
    
    const existingSituations = await AsyncStorage.getItem(key);
    let situations = existingSituations ? JSON.parse(existingSituations) : [];

    situations.push(situation);

    await AsyncStorage.setItem(key, JSON.stringify(situations));
}

export async function loadSituations(key) {
    try {
        const situation = await AsyncStorage.getItem(key);
        return situation;
    } catch (e) {
        console.warn('Failed to load situations', e);
        return null;
    }

}