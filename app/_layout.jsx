// _layout.jsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import HeaderWithMenu from './HeaderWithMenu';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ title: 'Log In', headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: 'Sign Up', headerShown: true }} />
        <Stack.Screen
          name="home"
          options={{
            title: 'Home',
            header: () => <HeaderWithMenu />,
          }}
        />
        <Stack.Screen name="profile" options={{ title: 'Profile', headerShown: true }} />
        <Stack.Screen name="menu" options={{ title: 'Menu', headerShown: true }} />
        <Stack.Screen name="scan-nfc" options={{ title: 'Scan NFC Card', headerShown: true }} />
        <Stack.Screen name="travel-history" options={{ title: 'Travel History', headerShown: true }} />
        <Stack.Screen name="activity-logs" options={{ title: 'Activity Logs', headerShown: true }} />
        <Stack.Screen name="inspect" options={{ title: 'Inspect', headerShown: true }} />
        <Stack.Screen name="inspection-logs" options={{ title: 'Inspection Logs', headerShown: true }} />
        <Stack.Screen name="start-inspection" options={{ title: 'Start Inspection', headerShown: true }} />
        <Stack.Screen name="admin-panel" options={{ title: 'Admin Panel', headerShown: true }} />
      </Stack>
    </ThemeProvider>
  );
}
