// Profile.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { config } from './config';
import globalStyles from './globalstyles';
import useNFC from './UseNFC';
import NfcDisabledModal from './NfcDisabledModal';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [showNfcDisabledModal, setShowNfcDisabledModal] = useState(false);
  const router = useRouter();
  const { scanning, tagData, startScanning, endScanning, checkNfcEnabled, enableNFC } = useNFC();

  // Fetch user info when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchUserInfo = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.push('/');
          return;
        }

        try {
          const response = await fetch(`${config.API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok && isActive) {
            const data = await response.json();
            setUserInfo(data);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };

      fetchUserInfo();
      return () => {
        isActive = false;
      };
    }, [])
  );

  // Handle NFC scan: update backend if tag data is received
  useEffect(() => {
    if (tagData && userInfo) {
      const nfcCardId = tagData.id;
      updateNfcCardId(nfcCardId);
      endScanning();
    }
  }, [tagData]);

  // Function to send the NFC Card ID to the backend and update UI on success.
  const updateNfcCardId = async (nfcCardId) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/link-nfc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nfcCardId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'An error occurred while linking the NFC card.');
        return;
      }
      
      setUserInfo((prev) => ({ ...prev, tag_id: nfcCardId }));
      
    } catch (error) {
      console.error('Error updating NFC card ID:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  // Function to unlink the NFC Card ID
  const unlinkNfcCard = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/unlink-nfc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setUserInfo((prev) => ({ ...prev, tag_id: null }));
      } else {
        console.error('Failed to unlink NFC card ID');
      }
    } catch (error) {
      console.error('Error unlinking NFC card ID:', error);
    }
  };

  // Trigger NFC scanning with a check for NFC status
  const handleScanNFC = async () => {
    const isNfcEnabled = await checkNfcEnabled();
    if (isNfcEnabled) {
      startScanning();
    } else {
      setShowNfcDisabledModal(true);
    }
  };

  // Handle enabling NFC
  const handleEnableNFC = async () => {
    await enableNFC();
    setShowNfcDisabledModal(false);
    const isNfcEnabled = await checkNfcEnabled();
    if (isNfcEnabled) {
      startScanning();
    }
  };

  const handleCancelEnableNFC = () => {
    setShowNfcDisabledModal(false);
  };

  if (!userInfo) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#FFF' }}>
      <View style={globalStyles.listContainer}>
        <View style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>Username:</Text>
            <Text style={globalStyles.listItemPrimary}>{userInfo.username}</Text>
          </View>
        </View>
        <View style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>Last Name:</Text>
            <Text style={globalStyles.listItemPrimary}>{userInfo.surname}</Text>
          </View>
        </View>
        <View style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>First Name:</Text>
            <Text style={globalStyles.listItemPrimary}>{userInfo.firstname}</Text>
          </View>
        </View>
        <View style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>Middle Initial:</Text>
            <Text style={globalStyles.listItemPrimary}>{userInfo.middleinitial}</Text>
          </View>
        </View>
        <View style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>Age:</Text>
            <Text style={globalStyles.listItemPrimary}>{userInfo.age}</Text>
          </View>
        </View>
        <View style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>Gender:</Text>
            <Text style={globalStyles.listItemPrimary}>{userInfo.gender}</Text>
          </View>
        </View>
        <View style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>Phone Number:</Text>
            <Text style={globalStyles.listItemPrimary}>{userInfo.phonenumber}</Text>
          </View>
        </View>
        <View style={globalStyles.listItem}>
          <View style={globalStyles.listItemLeft}>
            <Text style={globalStyles.listItemDate}>NFC Card ID:</Text>
            <Text style={globalStyles.listItemPrimary}>
              {userInfo.tag_id ? userInfo.tag_id : 'Not linked'}
            </Text>
          </View>
          {userInfo.tag_id ? (
            <TouchableOpacity style={globalStyles.redListButton} onPress={unlinkNfcCard}>
              <Text style={globalStyles.listButtonText}>Unlink</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={globalStyles.blueListButton} onPress={handleScanNFC}>
              <Text style={globalStyles.listButtonText}>Link</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal for NFC scanning */}
      <Modal visible={scanning} animationType="none" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.scanningContainer}>
            <Text style={styles.scanningTitle}>Ready to Scan</Text>
            <Image source={require('../assets/images/nfc-icon.png')} style={styles.nfcIcon} />
            <Text style={styles.scanningText}>
              Please place your NFC Card at the back of your mobile device.
            </Text>
            <TouchableOpacity
              style={[globalStyles.button, { backgroundColor: '#e74c3c', marginTop: 20 }]}
              onPress={endScanning}
            >
              <Text style={globalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NFC Disabled Modal imported as a separate component */}
      <NfcDisabledModal 
        visible={showNfcDisabledModal} 
        onEnable={handleEnableNFC} 
        onCancel={handleCancelEnableNFC} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  scanningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  nfcIcon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  scanningText: {
    textAlign: 'center',
  },
});

export default Profile;
