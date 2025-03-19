import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import globalStyles from './globalstyles';

const TransactionHistory = () => {
  const [searchText, setSearchText] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

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
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactionHistory();
  };

  // Fetch detailed inspection data for the receipt modal
  const fetchInspectionDetails = async (transaction) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/inspections/${transaction.inspection_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedTransaction({
          ...data,
          scanned_datetime: transaction.scanned_datetime,
          fare: transaction.fare,
        });
        setShowReceiptModal(true);
      } else {
        console.error('Failed to fetch inspection details');
      }
    } catch (error) {
      console.error('Error fetching inspection details:', error);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  // Filter transactions based on search text
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

  const handleLogPress = (item) => {
    if (item.inspection_id) {
      fetchInspectionDetails(item);
    } else {
      console.error('No inspection_id found for this transaction');
    }
  };

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
            <TouchableOpacity
              style={globalStyles.listItem}
              onPress={() => handleLogPress(item)}
            >
              <View style={globalStyles.listItemLeft}>
                <Text style={globalStyles.listItemPrimary}>{formatDate(item.scanned_datetime)}</Text>
                <Text style={globalStyles.listItemDate}>Route: {`${item.origin} to ${item.destination}`}</Text>
              </View>
              <View style={globalStyles.listItemRight}>
                <Text style={globalStyles.listItemSecondary}>{`- ${item.fare}`}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>

      {/* Limited Receipt Modal with Scanned Date Time and Fare */}
      <Modal visible={showReceiptModal} animationType="none" transparent={true}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.receiptOverlay}>
            <View style={styles.receiptWrapper}>
              <View style={[globalStyles.modalContainer, styles.receiptContainer]}>
                <Text style={styles.receiptTitle}>Transaction Receipt</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Inspection ID:</Text>
                  <Text style={styles.receiptValue}>
                    {selectedTransaction?.inspectionId || 'N/A'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Route:</Text>
                  <Text style={styles.receiptValue}>
                    {selectedTransaction?.route?.origin} to {selectedTransaction?.route?.destination}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Added Rate:</Text>
                  <Text style={styles.receiptValue}>
                    PHP {Number(selectedTransaction?.route?.added_rate || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Scanned Date Time:</Text>
                  <Text style={styles.receiptValue}>
                    {selectedTransaction?.scanned_datetime ? formatDate(selectedTransaction.scanned_datetime) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Fare:</Text>
                  <Text style={styles.receiptValue}>
                    PHP {Number(selectedTransaction?.fare || 0).toFixed(2)}
                  </Text>
                </View>
                {selectedTransaction?.currentFareRates && (
                  <>
                    <View style={styles.receiptDivider} />
                    <Text style={styles.receiptSubtitle}>Fare Rates</Text>
                    {selectedTransaction.currentFareRates.map((fareInfo, index) => (
                      <View style={styles.receiptRow} key={index}>
                        <Text style={styles.receiptLabel}>{fareInfo.passenger_type}:</Text>
                        <Text style={styles.receiptValue}>
                          PHP {Number(fareInfo.current_fare_rate).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
              <TouchableOpacity
                style={[globalStyles.button, styles.outsideButton]}
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={globalStyles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  receiptOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF', // Solid white background to block the underlying screen
  },
  receiptWrapper: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'stretch',
    backgroundColor: '#fff', // Ensure wrapper matches receipt background
    borderRadius: 10,
    paddingBottom: 10, // Space for the button
  },
  receiptContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
  },
  outsideButton: {
    marginTop: 10,
    alignSelf: 'center',
    width: '100%',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  receiptLabel: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    width: 130,
  },
  receiptValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  receiptDivider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  receiptSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
});

export default TransactionHistory;