import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { config } from './config';
import globalStyles from './globalstyles';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

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

  const handleScanNFC = () => {
    router.push('/scan-nfc'); // Navigate to the NFC scanning page
  };

  if (!userInfo) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#FFF' }}
    >
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
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  scanText: {
    color: '#3578E5',
    fontSize: 16,
    textAlign: 'right',
  },
});

export default Profile;