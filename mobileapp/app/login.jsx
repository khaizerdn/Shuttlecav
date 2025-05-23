import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import globalStyles from './globalstyles';

const Login = () => {
  const [username, setUsername] = useState('');
  const [mpin, setMpin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const pinInputRef = useRef(null);

  // Load username from AsyncStorage on mount
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('savedUsername');
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error('Error loading username:', error);
      }
    };
    loadUsername();
  }, []);

  // Save username when it changes (debounced)
  useEffect(() => {
    const saveUsername = async () => {
      try {
        if (username) {
          await AsyncStorage.setItem('savedUsername', username);
        }
      } catch (error) {
        console.error('Error saving username:', error);
      }
    };
    saveUsername();
  }, [username]);

  // Handle login logic
  const handleLogin = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: mpin }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('userToken', data.token);
        setMpin(''); // Reset MPIN after successful login
        router.push('/home');
      } else {
        setErrorMessage('Your username or MPIN is incorrect.');
        setMpin('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
      setMpin('');
    }
  }, [username, mpin, router]);

  // Trigger login when MPIN reaches 4 digits
  useEffect(() => {
    if (mpin.length === 4) {
      handleLogin();
    }
  }, [mpin, handleLogin]);

  // Render PIN circles
  const renderPinCircles = useCallback(() => {
    return Array.from({ length: 4 }, (_, i) => (
      <View
        key={i}
        style={[
          styles.pinCircle,
          { backgroundColor: mpin.length > i ? '#000' : '#fff' }
        ]}
      />
    ));
  }, [mpin]);

  // Focus the hidden input
  const focusPinInput = useCallback(() => {
    pinInputRef.current?.focus();
  }, []);

  return (
    <View style={globalStyles.container}>
      <Image 
        source={require('../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={globalStyles.mainTitle}>SHUTTLECAV</Text>
      
      <TextInput
        style={[globalStyles.listItem, styles.centeredInput]}
        placeholder="Username"
        placeholderTextColor="#A9A9A9"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TouchableOpacity 
        style={styles.pinContainer}
        onPress={focusPinInput}
        activeOpacity={1}
      >
        <Text style={styles.pinLabel}>Enter your MPIN</Text>
        <View style={styles.pinCircles}>
          {renderPinCircles()}
        </View>
        <TextInput
          ref={pinInputRef}
          style={styles.hiddenInput}
          keyboardType="numeric"
          maxLength={4}
          value={mpin}
          onChangeText={setMpin}
          secureTextEntry
          autoFocus={false}
        />
      </TouchableOpacity>
  
      {errorMessage && (
        <Text style={globalStyles.inputErrorText}>{errorMessage}</Text>
      )}
  
      <View style={globalStyles.separator}/>
  
      <TouchableOpacity>
        <Text style={globalStyles.linkText}>Forgot MPIN?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={globalStyles.linkText}>Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.termsLink}
        onPress={() => router.push('/terms-and-conditions')}
      >
        <Text style={globalStyles.linkText}>Terms and Conditions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  centeredInput: {
    textAlign: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  pinContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  pinLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  pinCircles: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  pinCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
});

export default Login;