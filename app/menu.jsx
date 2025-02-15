// Menu.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Menu = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Text style={styles.menuItem}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/travel-history')}>
        <Text style={styles.menuItem}>Travel History</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/activity-logs')}>
        <Text style={styles.menuItem}>Activity Logs</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/inspect')}>
        <Text style={styles.menuItem}>Inspect</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/inspection-logs')}>
        <Text style={styles.menuItem}>Inspection Logs</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.menuItem}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

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

export default Menu;
