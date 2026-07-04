import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export async function storeSituation(Timestamp, TrueGameData, GameData, RobotStatus, audio = null) {
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
        "RobotStatus": RobotStatus,
        "status": { "GameData": "" }
    }

    if (audio) {
        situation["audio"] = audio;
        situation["status"]["AudioData"] = ""
    }

    const existingSituations = await AsyncStorage.getItem(key);
    let situations = existingSituations ? JSON.parse(existingSituations) : [];

    situations.push(situation);

    await AsyncStorage.setItem(key, JSON.stringify(situations));
}

export async function updateSituationStatus(key, uuid, GameStatus, AudioStatus = null) {
    try {
        const situations = await AsyncStorage.getItem(key);
        let situation_list = situations ? JSON.parse(situations) : [];

        for (const situation of situation_list) {
            if (situation.uuid === uuid) {
                situation["status"]["GameData"] = GameStatus;
                if (AudioStatus) {
                    situation["status"]["AudioData"] = AudioStatus;
                }
            }
        }
        await AsyncStorage.setItem(key, JSON.stringify(situation_list));
    } catch (e) {
        console.warn('Failed to load situations', e);
        return null;
    }
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