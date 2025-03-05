// Login.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { config } from './config';
import globalStyles from './globalstyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const [username, setUsername] = useState('');
  const [mpin, setMpin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: mpin }), // Map mpin to password
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('userToken', data.token);
        router.push('/home');
      } else {
        setErrorMessage('Your username or MPIN is incorrect.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <View style={globalStyles.container}>
      <Image source={require('../assets/images/logo.png')} style={{ width: 220, height: 220, marginBottom: 20 }} />
      <Text style={globalStyles.mainTitle}>SHUTTLECAV</Text>
      <TextInput
        style={globalStyles.listItem}
        placeholder="Username"
        placeholderTextColor="#A9A9A9"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={globalStyles.listItem}
        placeholder="MPIN (4 digits)"
        placeholderTextColor="#A9A9A9"
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
        value={mpin}
        onChangeText={setMpin}
      />
      {errorMessage ? <Text style={globalStyles.inputErrorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Log in</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={globalStyles.linkText}>Forgot MPIN?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={globalStyles.linkText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;