// Profile.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { config } from './config';
import globalStyles from './globalstyles';
import useNFC from './UseNFC';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();
  const { scanning, tagData, startScanning, endScanning } = useNFC();

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
            headers: { Authorization: `Bearer ${token}` }
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
      return () => { isActive = false; };
    }, [])
  );

  // When a tag is scanned, update the profile's NFC Card ID.
  useEffect(() => {
    if (tagData && userInfo) {
      // Assume the NFC card id is in tagData.id.
      setUserInfo(prev => ({ ...prev, nfcCardId: tagData.id }));
      // Optionally, persist this update to your backend.
      endScanning();
    }
  }, [tagData]);

  const handleScanNFC = () => {
    startScanning();
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
            {userInfo.nfcCardId ? (
              <Text style={globalStyles.listItemPrimary}>{userInfo.nfcCardId}</Text>
            ) : (
              <TouchableOpacity onPress={handleScanNFC}>
                <Text style={styles.scanText}>Scan NFC Card</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Full Screen Modal with White Background */}
      <Modal visible={scanning} animationType="fade" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.scanningContainer}>
            <Text style={styles.scanningTitle}>Ready to Scan</Text>
            <Image
              source={require('../assets/images/nfc-icon.png')}
              style={styles.nfcIcon}
            />
            <Text style={styles.scanningText}>
              Please place your NFC Card at the back of your mobile device.
            </Text>
            <TouchableOpacity
              style={[globalStyles.button, { backgroundColor: 'red', marginTop: 20 }]}
              onPress={endScanning}
            >
              <Text style={globalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scanText: {
    color: '#3578E5',
    fontSize: 16,
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF', // White background for the modal
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
