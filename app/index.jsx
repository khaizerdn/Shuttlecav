// index.jsx
import React from 'react';
import LogIn from './login';  // Import the LogIn component
import { useFonts } from '@expo-google-fonts/inter'; // Importing the font hook
import { AppLoading } from 'expo';
import { ActivityIndicator } from 'react-native';

const App = () => {
  const [fontsLoaded] = useFonts({
    Regular: require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    Bold: require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
    Black: require('@expo-google-fonts/inter/Inter_900Black.ttf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!fontsLoaded) {
    return <AppLoading />; // Wait until fonts are loaded
  }
  return <LogIn />;
};

export default App;
