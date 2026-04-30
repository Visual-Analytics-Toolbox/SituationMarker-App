import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadSituations } from '../utils/storeData';
import { useToken } from '../utils/auth';

async function uploadSitation(situation)  {
    [token] = useToken();
    const resp = await fetch(
            "http://127.0.0.1:8000/api/situations",
            {
              method: "POST",
              headers: { "Content-Type": "application/json",
                        "Authorization": `Token ${token}`
              },
              body: situation,
            },
          );
          const text = await resp.text();
          console.log("Status:", resp.status, "Body:", text);
          if (!resp.ok) {
            throw new Error(`Upload failed (${resp.status}): ${text}`);
          }
}


export default function MarkedSituationsScreen() {
    const [keys, setKeys] = useState([]);
    const [situationsByKey, setSituationsByKey] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        keys.map((key) => {
            situationsByKey[key].map((situation)=> {
                console.log(situation);
                // uploadSitation(situation);
            })
        })

        }

        return (
            <View style={styles.container}>
                <Text style={styles.title}>Marked Situations</Text>

                {loading ? (
                    <Text style={styles.subtext}>Loading situations..</Text>
                ) : error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : keys.length === 0 ? (
                    <Text style={styles.subtext}>No situations recorded</Text>
                ) : (
                    <View style={styles.contentWrapper}>
                        {/* Button is centered using alignSelf in the stylesheet */}
                        <TouchableOpacity style={styles.button} onPress={handleUploadAll}>
                            <Text style={styles.buttonText}>Upload all</Text>
                        </TouchableOpacity>

                        {/* ScrollView naturally left-aligns, but styles ensure it stays that way */}
                        <ScrollView style={styles.keysContainer} contentContainerStyle={styles.keysContent}>
                            <Text style={styles.label}>Games:</Text>

                            {keys.map((key) => (
                                <View key={key} style={styles.keyBlock}>
                                    <Text style={styles.keyText}>{key}</Text>

                                    {Array.isArray(situationsByKey[key]) && situationsByKey[key].length > 0 ? (
                                        situationsByKey[key].map((situation, index) => {
                                            const timestampMs = situation?.timestamp;
                                            const date = timestampMs ? new Date(timestampMs) : null;
                                            const formatted = date ? date.toLocaleString() : 'Unknown date';

                                            return (
                                                <Text key={`${key}-${index}`} style={styles.situationText}>
                                                    {formatted}
                                                </Text>
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
            paddingHorizontal: 32,
            borderRadius: 8,
            marginBottom: 20,
            alignSelf: 'center',
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
        situationText: {
            marginLeft: 8,
            color: '#fff',
            marginBottom: 4
        }
    });