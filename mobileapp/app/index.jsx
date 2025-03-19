import React, { useEffect } from 'react';
import LogIn from './login';  // Import the LogIn component
import { useFonts } from '@expo-google-fonts/inter';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { config } from './config';

const App = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Regular: require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    Bold: require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
    Black: require('@expo-google-fonts/inter/Inter_900Black.ttf'),
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          const response = await fetch(`${config.API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            // Token is valid; redirect to /home.
            router.push('/home');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
        }
      }
    };
    checkToken();
  }, [router]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return <LogIn />;
};

export default App;
