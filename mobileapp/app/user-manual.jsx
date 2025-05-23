import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const UserManual = () => {
  const { role } = useLocalSearchParams();
  const router = useRouter();

  const availableManuals = [
    { label: 'User Manual', role: 'user' },
    { label: 'Inspector Manual', role: 'inspector' },
    { label: 'Admin Manual', role: 'admin' },
  ];

  const manualsToShow = availableManuals.filter(m => {
    if (role === 'admin') {
      return true;
    } else if (role === 'inspector') {
      return m.role === 'user' || m.role === 'inspector';
    } else {
      return m.role === 'user';
    }
  });

  return (
    <View style={styles.container}>
      {manualsToShow.map((manual, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => router.push(`/help-slideshow?role=${manual.role}`)}
        >
          <Text style={styles.buttonText}>{manual.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default UserManual;