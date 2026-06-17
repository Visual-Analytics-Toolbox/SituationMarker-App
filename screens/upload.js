import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadSituations } from '../utils/storeData';
import { useToken } from '../utils/auth';
import { useAudioPlayer } from 'expo-audio';


async function uploadSituation(situation, token) {
    // Ensure the body is stringified if it's an object

    const payload = {
        json_data: situation
    };
    try {
        const resp = await fetch(
            "https://vat.berlin-united.com/api/situations/gc/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify(payload)
            }
        );

        const text = await resp.text();
        console.log("Status:", resp.status, "Body:", text);

        if (!resp.ok) {
            throw new Error(`Upload failed (${resp.status}): ${text}`);
        }

        return text; // Optional: return data if needed
    } catch (error) {
        console.error("Network or Server Error:", error);
        throw error;
    }
}




export default function MarkedSituationsScreen() {
    const [keys, setKeys] = useState([]);
    const [situationsByKey, setSituationsByKey] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const audioPlayer = useAudioPlayer(null);
    const [token] = useToken();
    const handlePlayAudio = (audioUri) => {
        if (!audioUri) {
            return;
        }

        try {
            audioPlayer.replace(audioUri);
            audioPlayer.play();
        } catch (e) {
            console.warn('Failed to play audio:', e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadData() {
                try {
                    setLoading(true);
                    setError(null);

                    const allKeys = await AsyncStorage.getAllKeys();
                    if (!active) return;
                    setKeys(allKeys);

                    const rawValues = await Promise.all(
                        allKeys.map(key => loadSituations(key))
                    );

                    if (!active) return;

                    const loadedSituations = {};
                    allKeys.forEach((key, index) => {
                        const raw = rawValues[index];
                        if (raw) {
                            try {
                                loadedSituations[key] = JSON.parse(raw);
                            } catch {
                                loadedSituations[key] = raw;
                            }
                        } else {
                            loadedSituations[key] = null;
                        }
                    });

                    if (active) {
                        setSituationsByKey(loadedSituations);
                    }
                } catch (e) {
                    if (active) {
                        setError(e?.message ?? 'Failed to load AsyncStorage keys');
                    }
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            }

            loadData();

            return () => {
                active = false;
            };
        }, [])
    );

    const handleUploadAll = async () => {
        // 1. Get your token at the component level where this handler lives
        // const [token] = useToken(); 
        console.log(token)
        // Use for...of loops instead of .map() to properly await async tasks
        for (const key of keys) {
            const situations = situationsByKey[key] || [];

            for (const situation of situations) {
                if (!situation?.audio) {
                    console.log("Uploading situation without audio...");

                    try {
                        // Pass the token down to your fixed upload function
                        await uploadSituation(situation, token);
                    } catch (error) {
                        console.error(`Failed to upload item under key ${key}:`, error);
                        // Optional: use 'break' or 'return' if you want to stop the whole queue on failure
                    }

                } else {
                    // TODO: figure out how we want to upload audio files after situation endpoint is done
                    console.log("Skipping audio situation for now");
                }
            }
        }
    };

    const handleDeleteSituation = async (gameKey, indexToDelete) => {
        try {
            // 1. Get the current array of situations for this game key
            const currentSituations = situationsByKey[gameKey] || [];

            // 2. Filter out the specific situation by its index
            const updatedSituations = currentSituations.filter((_, index) => index !== indexToDelete);

            if (updatedSituations.length === 0) {
                // If no situations are left for this game, remove the key entirely
                await AsyncStorage.removeItem(gameKey);

                // Update local state to completely drop the key
                setKeys(prevKeys => prevKeys.filter(k => k !== gameKey));
                setSituationsByKey(prev => {
                    const copy = { ...prev };
                    delete copy[gameKey];
                    return copy;
                });
            } else {
                // Otherwise, update AsyncStorage with the remaining items
                await AsyncStorage.setItem(gameKey, JSON.stringify(updatedSituations));

                // Update local state for just this key's array
                setSituationsByKey(prev => ({
                    ...prev,
                    [gameKey]: updatedSituations
                }));
            }
        } catch (e) {
            console.error("Failed to delete situation:", e);
            alert("Could not delete the situation.");
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Marked Situations</Text>
            <Text style={styles.subtext}>All marked Situations grouped by game.{"\n"} You can upload these situations to VAT. {"\n"}Replay audio situations (marked with a 🎙️) by clicking on them.</Text>
            {loading ? (
                <Text style={styles.subtext}>Loading situations..</Text>
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : keys.length === 0 ? (
                <Text style={styles.subtext}>No situations recorded</Text>
            ) : (
                <View style={styles.contentWrapper}>
                    <View style={styles.flexbox}>
                        <TouchableOpacity style={styles.button} onPress={handleUploadAll}>
                            <Text style={styles.buttonText}>Upload all</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} >
                            <Text style={styles.buttonText}>Delete all</Text>
                        </TouchableOpacity>
                    </View>
                    {/* ScrollView naturally left-aligns, but styles ensure it stays that way */}
                    <ScrollView style={styles.keysContainer} contentContainerStyle={styles.keysContent}>
                        <Text style={styles.label}>Situations:</Text>

                        {keys.map((key) => (
                            <View key={key} style={styles.keyBlock}>
                                <Text style={styles.keyText}>{`Game: ${key}`}</Text>

                                {Array.isArray(situationsByKey[key]) && situationsByKey[key].length > 0 ? (
                                    situationsByKey[key].map((situation, index) => {
                                        const timestampMs = situation?.timestamp;
                                        const date = timestampMs ? new Date(timestampMs) : null;
                                        const formattedTime = date
                                            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                            : 'Unknown date';
                                        const audio = situation?.audio;
                                        let formatted_text = audio ? `${formattedTime} 🎙️` : formattedTime;
                                        const secsRemaining = situation?.TrueGameData?.secsRemaining
                                        const minutes = Math.floor(secsRemaining / 60);
                                        const seconds = secsRemaining - minutes * 60;
                                        formatted_text = `${formatted_text} | game time: ${minutes}:${seconds}`;


                                        if (audio) {
                                            return (
                                                <TouchableOpacity
                                                    key={`${key}-${index}`}
                                                    onPress={() => handlePlayAudio(audio)}
                                                    style={styles.situationButton}
                                                >
                                                    <Text style={styles.situationText}>{formatted_text}</Text>
                                                </TouchableOpacity>
                                            );
                                        }

                                        return (
                                            <View key={`${key}-${index}`} style={styles.situationButton}>
                                                <Text style={styles.situationText}>
                                                    {formatted_text}
                                                </Text>
                                                {/* TODO delete data her */}
                                                <TouchableOpacity onPress={() => handleDeleteSituation(key, index)}>
                                                    <Text>
                                                        🗑
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })
                                ) : (
                                    <Text style={styles.situationText}>No situation data</Text>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#121212'
    },
    flexbox: {
        flexDirection: 'row',
        backgroundColor: '#121212',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    title: {
        margin: 30,
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    subtext: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center'
    },
    error: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center'
    },
    contentWrapper: {
        flex: 1
    },
    button: {
        backgroundColor: '#333',
        paddingVertical: 12,
        // 1. REMOVE or sharply reduce paddingHorizontal
        paddingHorizontal: 8,    // Small padding just so text doesn't touch the edges
        borderRadius: 8,
        // 2. CHANGE marginBottom to marginHorizontal
        marginHorizontal: 6,     // Adds space BETWEEN the buttons instead of below them
        flex: 1,
    },
    buttonText: {
        color: '#00ff00',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16
    },
    keysContainer: {
        flex: 1,
        width: '100%',
    },
    keysContent: {
        alignItems: 'flex-start',
        paddingBottom: 20
    },
    label: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'left',
        width: '100%'
    },
    keyBlock: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 8,
        width: '100%',
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    keyText: {
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 16,
        color: '#fff'
    },
    situationButton: {
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: '#222',
        marginBottom: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    situationText: {
        marginLeft: 8,
        color: '#fff',
        marginBottom: 4
    }
});