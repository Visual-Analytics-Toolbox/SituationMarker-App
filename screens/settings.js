import { StyleSheet, Text, View, TouchableOpacity, Vibration, TextInput, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { useToken } from '../utils/auth';

export default function Settings() {
    const [token, setValue] = useToken();
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSaveFeedback = () => {
        // Trigger haptic feedback
        Vibration.vibrate(50); 
        
        // Show success message
        setShowSuccess(true);
        
        // Hide it after 2.5 seconds
        setTimeout(() => {
            setShowSuccess(false);
        }, 2500);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.status}>Token</Text>
            <TextInput 
                style={styles.ipInput}
                value={token}
                onChangeText={setValue}
                returnKeyType="done" // Changes the enter key to say "Done"
                onSubmitEditing={handleSaveFeedback} // Triggers when "Done" is pressed
                placeholder="Enter Token Here"
                placeholderTextColor="#555"
            />

            {/* Visual Feedback Message */}
            {showSuccess && (
                <Text style={styles.successText}>✅ Token saved successfully!</Text>
            )}

            <View style={styles.tokenInfo}> 
                <Text style={styles.status}>Tokens can be obtained from </Text>
                <Text style={styles.link} onPress={() => Linking.openURL('https://vat.berlin-united.com/admin')}>
                    https://vat.berlin-united.com/admin
                </Text>
                <Text style={styles.status}>
                    If you can't obtain a token, marked Sitations are only stored locally.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' },
    status: { color: '#aaa', fontSize: 20, textAlign: 'center' },
    ipInput: { padding: 10, backgroundColor: '#333', borderRadius: 5, color: '#00ff00', fontWeight: 'bold', width: 210, textAlign: 'center', marginBottom: 10 },
    successText: { color: '#00ff00', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }, // New style
    tokenInfo: { padding: 30 },
    link: { color: '#ec008c', fontSize: 20, textAlign: 'center', marginVertical: 10 }
});