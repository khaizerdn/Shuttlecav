import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, RefreshControl, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalstyles';
import { config } from './config';
import { useNavigation, CommonActions } from '@react-navigation/native';

const Home = () => {
  const [firstname, setFirstname] = useState('');
  const [surname, setSurname] = useState('');
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();
  const allowNavigationRef = useRef(false);

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
        setRole(data.role || 'Passenger');
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
        setTransactionHistory(data.slice(0, 10));
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserInfo(), fetchTransactionHistory()]);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
      fetchTransactionHistory();

      allowNavigationRef.current = false;

      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (allowNavigationRef.current) return;
        e.preventDefault();
        setIsLogoutModalVisible(true);
      });

      return () => {
        unsubscribe();
      };
    }, [navigation])
  );

  const handleConfirmLogout = async () => {
    setIsLogoutModalVisible(false);
    await handleLogout();
    allowNavigationRef.current = true;
    navigation.goBack();
  };

  const renderTransactionItem = (item) => (
    <View style={globalStyles.listItem} key={item.id.toString()}>
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
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={localStyles.profileSection}>
        <Image source={require('../assets/images/user-icon.png')} style={localStyles.profileImage} />
        <View>
        <Text style={localStyles.subText}>Good day, {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Passenger'}!</Text>
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
        <View>
          {transactionHistory.length > 0 ? (
            transactionHistory.map(renderTransactionItem)
          ) : (
            <Text style={localStyles.noTransactions}>No transactions available</Text>
          )}
        </View>
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
                onPress={handleConfirmLogout}
              >
                <Text style={globalStyles.actionButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  noTransactions: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
};

export default Home;