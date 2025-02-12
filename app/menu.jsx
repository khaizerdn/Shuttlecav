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
      <Text style={styles.menuItem}>Settings</Text>
      <Text style={styles.menuItem} onPress={handleLogout}>Logout</Text>
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