import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadSituations } from '../utils/storeData';

export default function Upload() {
    const [keys, setKeys] = useState([]);
    const [situationsByKey, setSituationsByKey] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            async function loadKeys() {
                try {
                    const allKeys = await AsyncStorage.getAllKeys();
                    if (!active) return;
                    setKeys(allKeys);

                    const loadedSituations = {};
                    for (const key of allKeys) {
                        const raw = await loadSituations(key);
                        if (!active) return;
                        if (raw) {
                            try {
                                loadedSituations[key] = JSON.parse(raw);
                            } catch {
                                loadedSituations[key] = raw;
                            }
                        } else {
                            loadedSituations[key] = null;
                        }
                    }
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

            loadKeys();
            return () => {
                active = false;
            };
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.status}>Upload</Text>
            {loading ? (
                <Text style={styles.subtext}>Loading situations..</Text>
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : keys.length === 0 ? (
                <Text style={styles.subtext}>No situations recorded</Text>
            ) : (
                <View style={styles.keysContainer}>
                    <Text style={styles.label}>Games:</Text>
                    {keys.map((key) => (
                        <View key={key} style={styles.keyBlock}>
                            <Text style={styles.keyText}>{key}</Text>
                            {Array.isArray(situationsByKey[key]) ? (
                                situationsByKey[key].map((situation, index) => {
                                    const ts = situation?.timestamp;
                                    const timestampMs = ts;
                                    const date = timestampMs ? new Date(timestampMs) : null;
                                    const formatted = date.toLocaleString();
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
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 24 },
    status: { color: '#aaa', fontSize: 20, marginBottom: 16 },
    label: { color: '#fff', fontSize: 16, marginBottom: 8 },
    keyBlock: { width: '100%', marginBottom: 12, padding: 10, backgroundColor: '#1e1e1e', borderRadius: 8 },
    keyText: { color: '#ddd', fontSize: 14, marginBottom: 4 },
    situationText: { color: '#bbb', fontSize: 12 },
    subtext: { color: '#888', fontSize: 14 },
    error: { color: '#ff6666', fontSize: 14 },
    keysContainer: { width: '100%', alignItems: 'flex-start' }
});