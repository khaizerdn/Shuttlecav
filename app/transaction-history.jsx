import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import globalStyles from './globalstyles';

const TransactionHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format the date as "January 25, 2025 at 8:32 AM"
  const formatDate = (datetime) => {
    const dateObj = new Date(datetime);
    const datePart = dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    });
    return `${datePart} at ${timePart}`;
  };

  // Fetch transaction history from the API endpoint
  const fetchTransactionHistory = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/transaction-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactionHistory(data);
      } else {
        console.error('Failed to fetch transaction history');
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  // Filter transactions based on search text.
  const filteredHistory = transactionHistory.filter((item) => {
    const lowerSearch = searchText.toLowerCase();
    const formattedDate = formatDate(item.scanned_datetime);
    return (
      formattedDate.toLowerCase().includes(lowerSearch) ||
      (item.origin && item.origin.toLowerCase().includes(lowerSearch)) ||
      (item.destination && item.destination.toLowerCase().includes(lowerSearch)) ||
      (item.fare && item.fare.toString().toLowerCase().includes(lowerSearch))
    );
  });

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Search Bar */}
      <TextInput
        style={globalStyles.input}
        placeholder="Search"
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Transaction History List */}
      <View style={globalStyles.listContainer}>
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={globalStyles.listItem}>
              <View style={globalStyles.listItemLeft}>
                <Text style={globalStyles.listItemPrimary}>{formatDate(item.scanned_datetime)}</Text>
                <Text style={globalStyles.listItemDate}>Route: {`${item.origin} to ${item.destination}`}</Text>
              </View>
              <View style={globalStyles.listItemRight}>
                <Text style={globalStyles.listItemSecondary}>{`- ${item.fare}`}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default TransactionHistory;
