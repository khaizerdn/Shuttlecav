import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { config } from './config';

const Menu = () => {
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          const response = await fetch(`${config.API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const user = await response.json();
            setRole(user.role); // role can be 'admin', 'inspector', or NULL/empty
          } else {
            console.error('Failed to fetch user info');
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      {/* Always available */}
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Text style={styles.menuItem}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/transaction-history')}>
        <Text style={styles.menuItem}>Transaction History</Text>
      </TouchableOpacity>

      {/* Inspector-specific menu items */}
      {role === 'inspector' && (
        <>
          <TouchableOpacity onPress={() => router.push('/inspect')}>
            <Text style={styles.menuItem}>Inspect</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/inspection-logs')}>
            <Text style={styles.menuItem}>Inspection Logs</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Admin sees all options */}
      {role === 'admin' && (
        <>
          <TouchableOpacity onPress={() => router.push('/activity-logs')}>
            <Text style={styles.menuItem}>Activity Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/admin-panel')}>
            <Text style={styles.menuItem}>Admin Panel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/inspect')}>
            <Text style={styles.menuItem}>Inspect</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/inspection-logs')}>
            <Text style={styles.menuItem}>Inspection Logs</Text>
          </TouchableOpacity>
          {/* You can add additional admin-specific menu items here */}
        </>
      )}

      {/* For users with no role (NULL) only Profile, Transaction History, and Logout are shown */}

      {/* Logout is always available */}
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.menuItem}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    fontSize: 20,
    color: '#000',
    marginBottom: 20,
  },
});
