import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

function ScanNFC() {
    useEffect(() => {
        console.log("NfcManager is starting...");
        NfcManager.start()
            .then(() => {
                console.log("NfcManager started successfully.");
            })
            .catch((error) => {
                console.warn("Error starting NfcManager:", error);
            });
    }, []);

    async function readNdef() {
        console.log("Attempting to read NFC tag...");

        try {
            const isSupported = await NfcManager.isSupported();
            const isEnabled = await NfcManager.isEnabled();

            console.log(`NFC Supported: ${isSupported}, Enabled: ${isEnabled}`);

            if (!isSupported) {
                console.warn('NFC is not supported on this device.');
                return;
            }

            if (!isEnabled) {
                console.warn('NFC is disabled. Please enable NFC.');
                return;
            }

            console.log("Requesting NFC technology...");
            await NfcManager.cancelTechnologyRequest();
            await NfcManager.requestTechnology(NfcTech.Ndef);
            console.log("Technology requested successfully.");

            const tag = await NfcManager.getTag();
            console.log('Tag found:', tag);
        } catch (ex) {
            console.warn('Error reading NFC tag:', ex);
        } finally {
            console.log("Cancelling NFC technology request...");
            await NfcManager.cancelTechnologyRequest();
        }
    }

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity onPress={readNdef}>
                <Text>Scan a Tag</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ScanNFC;
