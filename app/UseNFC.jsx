// UseNFC.jsx
import { useState, useEffect } from 'react';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const useNFC = () => {
  const [scanning, setScanning] = useState(false);
  const [tagData, setTagData] = useState(null);
  const [nfcEnabled, setNfcEnabled] = useState(null); // null means not yet checked

  // Initialize NFC Manager on mount
  useEffect(() => {
    console.log("Starting NFC Manager...");
    NfcManager.start()
      .then(() => console.log("NfcManager started successfully."))
      .catch((error) => console.warn("Error starting NfcManager:", error));

    // Check initial NFC status
    checkNfcEnabled();
  }, []);

  // Check if NFC is enabled
  const checkNfcEnabled = async () => {
    try {
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        console.warn('NFC is not supported on this device.');
        setNfcEnabled(false);
        return false;
      }
      const enabled = await NfcManager.isEnabled();
      setNfcEnabled(enabled);
      return enabled;
    } catch (error) {
      console.warn('Error checking NFC status:', error);
      setNfcEnabled(false);
      return false;
    }
  };

  // Redirect to NFC settings to enable it
  const enableNFC = async () => {
    try {
      await NfcManager.goToNfcSetting();
      // After returning from settings, recheck NFC status
      const enabled = await checkNfcEnabled();
      return enabled;
    } catch (error) {
      console.warn('Error redirecting to NFC settings:', error);
      return false;
    }
  };

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

  // Start scanning: clear any previous tag, set scanning active, and then read one tag
  const startScanning = async () => {
    setTagData(null);
    setScanning(true);
    await readNdef();
  };

  // End scanning manually
  const endScanning = () => {
    setScanning(false);
    setTagData(null);
  };

  return { scanning, tagData, startScanning, endScanning, checkNfcEnabled, enableNFC, nfcEnabled };
};

export default useNFC;