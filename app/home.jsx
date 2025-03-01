import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Dimensions, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import { config } from './config';
import { useNavigation, CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Home = () => {
  const [firstname, setFirstname] = useState('');
  const [surname, setSurname] = useState('');
  const [balance, setBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();
  const allowNavigationRef = useRef(false); // Use ref to track navigation allowance

  const formatDatetime = (datetimeStr) => {
    const date = new Date(datetimeStr.replace(' ', 'T'));
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const datePart = new Intl.DateTimeFormat('en-US', options).format(date);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
    return `${datePart} at ${hours}:${minutesFormatted}${ampm}`;
  };

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
        setBalance(parseFloat(data.balance));
      } else {
        console.error('Failed to fetch user info:', response.status);
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      router.push('/');
    }
  };

  const fetchTransactionHistory = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      router.push('/');
      return;
    }
    try {
      const response = await fetch(`${config.API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactionHistory(data);
      } else {
        console.error('Failed to fetch transaction history:', response.status);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  };

  const onCancel = () => {
    setIsLogoutModalVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchTransactionHistory();

      allowNavigationRef.current = false; // Reset on focus

      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (allowNavigationRef.current) return; // Allow navigation if confirmed
        e.preventDefault();
        setIsLogoutModalVisible(true);
      });

      return () => {
        unsubscribe();
      };
    }, [navigation])
  );

  // Custom confirm handler to match Menu flow and allow navigation
  const handleConfirmLogout = async () => {
    setIsLogoutModalVisible(false);
    await handleLogout();
    allowNavigationRef.current = true; // Allow navigation after logout
    navigation.goBack(); // Trigger back navigation to complete the flow
  };

  const renderTransactionItem = ({ item }) => (
    <View style={globalStyles.listItem}>
      <View style={globalStyles.listItemLeft}>
        <Text style={globalStyles.listItemDate}>{formatDatetime(item.scanned_datetime)}</Text>
        <Text style={globalStyles.listItemPrimary}>
          {item.origin} to {item.destination}
        </Text>
      </View>
      <View style={globalStyles.listItemRight}>
        <Text style={[globalStyles.listLeftBoxPrimaryText, { color: '#e74c3c' }]}>
          - {parseFloat(item.fare).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <View style={localStyles.profileSection}>
        <Image source={require('../assets/images/user-icon.png')} style={localStyles.profileImage} />
        <View>
          <Text style={localStyles.subText}>Good day,</Text>
          <Text style={localStyles.welcomeText}>{firstname} {surname}!</Text>
        </View>
      </View>
      <View style={localStyles.balanceContainer}>
        <Text style={localStyles.balanceLabel}>Available Balance:</Text>
        <Text style={localStyles.balanceAmount}>PHP {balance.toFixed(2)}</Text>
      </View>
      <View style={globalStyles.listContainer}>
        <View style={globalStyles.sectionTitleContainer}>
          <Text style={globalStyles.sectionTitle}>Transaction History:</Text>
        </View>
        <FlatList
          data={transactionHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransactionItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <Modal visible={isLogoutModalVisible} animationType="none" transparent>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Confirm Logout</Text>
            <Text style={globalStyles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View style={globalStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]}
                onPress={onCancel}
              >
                <Text style={globalStyles.actionButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]}
                onPress={handleConfirmLogout} // Use custom handler here
              >
                <Text style={globalStyles.actionButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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