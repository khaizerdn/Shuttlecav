// UseNFC.js
import { useState, useEffect } from 'react';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const useNFC = () => {
  const [scanning, setScanning] = useState(false);
  const [tagData, setTagData] = useState(null);

  // Initialize NFC Manager on mount.
  useEffect(() => {
    console.log("Starting NFC Manager...");
    NfcManager.start()
      .then(() => console.log("NfcManager started successfully."))
      .catch(error => console.warn("Error starting NfcManager:", error));
  }, []);

  const readNdef = async () => {
    try {
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        console.warn('NFC is not supported on this device.');
        return;
      }
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        console.warn('NFC is disabled. Please enable NFC.');
        return;
      }

      console.log("Cancelling any previous technology request...");
      await NfcManager.cancelTechnologyRequest();
      
      console.log("Requesting NfcTech.Ndef...");
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      const tag = await NfcManager.getTag();
      console.log('Tag found:', tag);
      setTagData(tag);
      return tag;
    } catch (ex) {
      console.warn('Error reading NFC tag:', ex);
    } finally {
      console.log("Cancelling NFC technology request...");
      await NfcManager.cancelTechnologyRequest();
    }
  };

  // Start scanning: clear any previous tag, set scanning active, and then read one tag.
  const startScanning = async () => {
    setTagData(null);
    setScanning(true);
    await readNdef();
  };

  // End scanning manually.
  const endScanning = () => {
    setScanning(false);
    setTagData(null);
  };

  return { scanning, tagData, startScanning, endScanning };
};

export default useNFC;
