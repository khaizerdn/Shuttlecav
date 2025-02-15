// StartInspection.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import globalStyles from './globalstyles';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

export default function StartInspection() {
  const { driver, plate } = useLocalSearchParams();
  const [scanning, setScanning] = useState(false);
  const [tagData, setTagData] = useState(null);

  // Initialize NFC Manager on mount.
  useEffect(() => {
    console.log("Starting NFC Manager...");
    NfcManager.start()
      .then(() => {
        console.log("NfcManager started successfully.");
      })
      .catch(error => {
        console.warn("Error starting NfcManager:", error);
      });
  }, []);

  // Function to read NFC tag using NfcManager
  const readNdef = async () => {
    console.log("readNdef: Attempting to read NFC tag...");
    try {
      const isSupported = await NfcManager.isSupported();
      console.log("readNdef: isSupported:", isSupported);
      const isEnabled = await NfcManager.isEnabled();
      console.log("readNdef: isEnabled:", isEnabled);

      if (!isSupported) {
        console.warn('NFC is not supported on this device.');
        return;
      }
      if (!isEnabled) {
        console.warn('NFC is disabled. Please enable NFC.');
        return;
      }

      console.log("readNdef: Cancelling any previous technology request...");
      await NfcManager.cancelTechnologyRequest();
      
      console.log("readNdef: Requesting NfcTech.Ndef...");
      await NfcManager.requestTechnology(NfcTech.Ndef);
      console.log("readNdef: Technology requested successfully.");

      const tag = await NfcManager.getTag();
      console.log('readNdef: Tag found:', tag);
      setTagData(tag);
      Alert.alert("NFC Tag Scanned", `Tag Data: ${JSON.stringify(tag)}`);
    } catch (ex) {
      console.warn('readNdef: Error reading NFC tag:', ex);
    } finally {
      console.log("readNdef: Cancelling NFC technology request...");
      await NfcManager.cancelTechnologyRequest();
    }
  };

  const handleStart = async () => {
    console.log("handleStart: Start button pressed.");
    setScanning(true);
    await readNdef();
  };

  const handleEnd = () => {
    console.log("handleEnd: End button pressed.");
    setScanning(false);
    setTagData(null);
    // Optionally, add any cleanup code if needed.
  };

  return (
    <View style={[globalStyles.container, { padding: 20 }]}>
      {/* Top Section: Title and (if scanning) NFC instructions */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {scanning ? (
          <>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              Ready to Scan
            </Text>
            <Image
              source={require('../assets/images/nfc-icon.png')} // Replace with your NFC icon image
              style={{ width: 120, height: 120, marginBottom: 20 }}
            />
            <Text style={{ textAlign: 'center' }}>
              Hold your NFC device near the NFC Card
            </Text>
          </>
        ) : (
          <Text
            style={{
              fontSize: 24,
              textAlign: 'center',
            }}
          >
            Please confirm the information below. If it's correct press the start button below and begin to scan nfc.
          </Text>
        )}
      </View>

      {/* Bottom Section: Information Container */}
      <View style={{ width: '100%', marginBottom: 20 }}>
        <View
          style={{
            backgroundColor: '#EAEAEA',
            borderRadius: 8,
            padding: 15,
            width: '100%',
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Driver</Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            {driver || 'N/A'}
          </Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Plate Number</Text>
          <Text style={{ fontSize: 16 }}>
            {plate || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      {scanning ? (
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: 'red' }]}
          onPress={handleEnd}
        >
          <Text style={globalStyles.buttonText}>End</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={globalStyles.button} onPress={handleStart}>
          <Text style={globalStyles.buttonText}>Start</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
