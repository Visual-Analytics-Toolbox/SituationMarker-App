import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storeSituation(Timestamp, TrueGameData, GameData, RobotStatus) {
    const n_date = new Date(TrueGameData.timestamp);
    const key = `${n_date.getFullYear()}_${n_date.getMonth()}_${n_date.getDay()}_${TrueGameData.team1.teamNumber}_vs_${TrueGameData.team2.teamNumber}`

    const situation = {
        "timestamp": Timestamp,
        "TrueGameData": TrueGameData,
        "GameData": GameData,
        "RobotStatus": RobotStatus
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