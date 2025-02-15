import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import { config } from './config';

const { width } = Dimensions.get('window');

const Home = () => {
  const [firstname, setFirstname] = useState('');
  const [surname, setSurname] = useState('');
  const router = useRouter();

  const balance = 500.0;
  const travelHistory = [
    { id: '1', date: 'January 20, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '2', date: 'January 19, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '3', date: 'January 18, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '4', date: 'January 17, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '5', date: 'January 16, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '6', date: 'January 20, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '7', date: 'January 19, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '8', date: 'January 18, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '9', date: 'January 17, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '10', date: 'January 16, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    // Add more items as needed...
  ];

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.push('/');
        return;
      }
      try {
        const response = await fetch(`${config.API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFirstname(data.firstname);
          setSurname(data.surname);
        } else {
          console.error('Failed to fetch user info:', response.status);
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        router.push('/');
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
      <View style={localStyles.profileSection}>
        <Image source={require('../assets/images/user-icon.png')} style={localStyles.profileImage} />
        <View>
          <Text style={localStyles.subText}>Good day!</Text>
          <Text style={localStyles.welcomeText}>{firstname} {surname}!</Text>
        </View>
      </View>

      {/* Balance Section */}
      <View style={localStyles.balanceContainer}>
        <Text style={localStyles.balanceLabel}>Available Balance:</Text>
        <Text style={localStyles.balanceAmount}>Php {balance.toFixed(2)}</Text>
      </View>

      {/* Travel History */}
      <View style={globalStyles.travelHistoryContainer}>
        <Text style={globalStyles.travelHistoryTitle}>Travel History:</Text>
        <FlatList
          data={travelHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={globalStyles.travelHistoryItem}>
              <View style={globalStyles.travelHistoryLeft}>
                <Text style={globalStyles.travelHistoryDate}>{item.date}</Text>
                <Text style={globalStyles.travelHistoryRoute}>{item.route}</Text>
              </View>
              <View style={globalStyles.travelHistoryRight}>
                <Text style={globalStyles.travelHistoryAmount}>{item.amount}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
};

const localStyles = {
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
};

export default Home;
