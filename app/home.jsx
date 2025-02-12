import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import { config } from './config'; // Import your config file

const { width } = Dimensions.get('window');

const Home = () => {
  const [firstname, setFirstname] = useState(''); // State to store the firstname
  const [surname, setSurname] = useState(''); // State to store the surname
  const router = useRouter();

  const balance = 500.0; // Sample Balance
  const travelHistory = [
    { id: '1', date: 'January 20, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '2', date: 'January 19, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '3', date: 'January 18, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '4', date: 'January 17, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '5', date: 'January 16, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '6', date: 'January 16, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '7', date: 'January 16, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '8', date: 'January 16, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
  ];

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/'); // Redirect to login if no token
        return;
      }

      try {
        const response = await fetch(`${config.API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFirstname(data.firstname); // Set the firstname from the API response
          setSurname(data.surname);   // Set the surname from the API response
        } else {
          console.error('Failed to fetch user info:', response.status);
          router.push('/'); // Redirect to login if the request fails
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        router.push('/'); // Redirect to login if there's an error
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.push('/');
  };

  return (
    <View style={globalStyles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={require('../assets/images/user-icon.png')} style={styles.profileImage} />
        <View>
        <Text style={styles.subText}>Good day!</Text>
          <Text style={styles.welcomeText}>{firstname} {surname}!</Text>
        </View>
      </View>

      {/* Balance Section */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Available Balance:</Text>
        <Text style={styles.balanceAmount}>Php {balance.toFixed(2)}</Text>
      </View>

      {/* Travel History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Travel History:</Text>
        <FlatList
          data={travelHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyRoute}>{item.route}</Text>
              <Text style={styles.historyAmount}>{item.amount}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }} // Prevents cutoff at the bottom
        />
      </View>
    </View>
  );
};

const styles = {
  profileSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    color: '#666',
  },
  balanceContainer: {
    width: '100%',
    backgroundColor: '#3578E5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFF',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    width: '100%',
  },
  historyContainer: {
    flex: 1, // Allows the list to expand
    width: '100%',
  },
  historyItem: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 14,
    color: '#777',
  },
  historyRoute: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyAmount: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'right',
  },
};

export default Home;