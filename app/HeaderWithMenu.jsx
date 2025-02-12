import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const HeaderWithMenu = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push('/menu')} style={styles.menuButton}>
        <Text style={styles.menuText}>  ☰</Text>
      </TouchableOpacity>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.headerTitle}>Shuttle Cav</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    borderBottomColor: '#EAEAEA',
  },
  menuButton: {
    marginLeft: 10,
  },
  menuText: {
    fontSize: 28,
    color: '#000',
  },
  logo: {
    width: 40,
    height: 40,
    marginLeft: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default HeaderWithMenu;
