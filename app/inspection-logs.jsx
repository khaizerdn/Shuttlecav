// inspection-logs.jsx
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

const InspectionLogs = () => {
  const [searchText, setSearchText] = useState('');
  const [inspectionLogs, setInspectionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // New state for pull-to-refresh
  const [inspectionOverview, setInspectionOverview] = useState(null);
  const [showInspectionOverviewModal, setShowInspectionOverviewModal] = useState(false);

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

  const fetchInspectionLogs = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/inspection-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInspectionLogs(data);
      } else {
        console.error('Failed to fetch inspection logs');
      }
    } catch (error) {
      console.error('Error fetching inspection logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Reset refreshing state after fetch completes
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true); // Show the refresh indicator
    fetchInspectionLogs(); // Trigger the data fetch
  };

  // Fetch detailed inspection data
  const fetchInspectionDetails = async (inspectionId) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/inspections/${inspectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInspectionOverview(data);
        setShowInspectionOverviewModal(true);
      } else {
        console.error('Failed to fetch inspection details');
      }
    } catch (error) {
      console.error('Error fetching inspection details:', error);
    }
  };

  useEffect(() => {
    fetchInspectionLogs();
  }, []);

  // Filter inspection logs based on search text
  const filteredLogs = inspectionLogs.filter((item) => {
    const lowerSearch = searchText.toLowerCase();
    const formattedDate = formatDate(item.start_datetime);
    return (
      formattedDate.toLowerCase().includes(lowerSearch) ||
      (item.driver && item.driver.toLowerCase().includes(lowerSearch)) ||
      (item.total_claimed_money &&
        item.total_claimed_money.toString().toLowerCase().includes(lowerSearch))
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Inspection Logs List */}
      <View style={globalStyles.listContainer}>
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={globalStyles.listItem}
              onPress={() => fetchInspectionDetails(item.id)}
            >
              <View style={globalStyles.listItemLeft}>
                <Text style={globalStyles.listItemPrimary}>
                  {formatDate(item.start_datetime)}
                </Text>
                <Text style={globalStyles.listItemDate}>Driver: {item.driver}</Text>
                <Text style={globalStyles.listItemDate}>Plate: {item.plate}</Text>
                <Text style={globalStyles.listItemDate}>
                  Route: {item.origin} to {item.destination}
                </Text>
              </View>
              <View style={globalStyles.listItemRight}>
                <Text style={[globalStyles.listItemSecondary, { color: '#3578E5' }]}>
                  + {item.total_claimed_money}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing} // Add refreshing prop
          onRefresh={onRefresh}   // Add onRefresh prop
        />
      </View>

      {/* Inspection Overview (Receipt) Modal */}
      <Modal visible={showInspectionOverviewModal} animationType="slide" transparent={true}>
        <ScrollView>
          <View style={globalStyles.modalOverlay}>
            <View style={styles.receiptWrapper}>
              <View style={[globalStyles.modalContainer, styles.receiptContainer]}>
                <Text style={styles.receiptTitle}>Inspection Receipt</Text>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Inspection ID:</Text>
                  <Text style={styles.receiptValue}>
                    {inspectionOverview?.inspectionId || 'N/A'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Inspector:</Text>
                  <Text style={styles.receiptValue}>
                    {inspectionOverview?.inspector || 'N/A'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Driver:</Text>
                  <Text style={styles.receiptValue}>
                    {inspectionOverview?.driver || 'N/A'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Plate Number:</Text>
                  <Text style={styles.receiptValue}>
                    {inspectionOverview?.plate || 'N/A'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Route:</Text>
                  <Text style={styles.receiptValue}>
                    {inspectionOverview?.route?.origin} to{' '}
                    {inspectionOverview?.route?.destination}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Added Rate:</Text>
                  <Text style={styles.receiptValue}>
                    PHP {Number(inspectionOverview?.route?.added_rate || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Total Passengers:</Text>
                  <Text style={styles.receiptValue}>
                    {inspectionOverview?.total_passengers || 0}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Total Money:</Text>
                  <Text style={styles.receiptValue}>
                    PHP {Number(inspectionOverview?.total_claimed_money || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Start Date:</Text>
                  <Text style={styles.receiptValue}>
                    {formatDate(inspectionOverview?.start_datetime)}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>End Date:</Text>
                  <Text style={styles.receiptValue}>
                    {inspectionOverview?.end_datetime
                      ? formatDate(inspectionOverview.end_datetime)
                      : 'N/A'}
                  </Text>
                </View>
                {inspectionOverview?.passengerCounts && (
                  <>
                    <View style={styles.receiptDivider} />
                    <Text style={styles.receiptSubtitle}>Passenger Breakdown</Text>
                    {Object.keys(inspectionOverview.passengerCounts).map((type, index) => (
                      <View style={styles.receiptRow} key={index}>
                        <Text style={styles.receiptLabel}>{type}:</Text>
                        <Text style={styles.receiptValue}>
                          {inspectionOverview.passengerCounts[type]}
                        </Text>
                      </View>
                    ))}
                  </>
                )}
                {inspectionOverview?.currentFareRates && (
                  <>
                    <View style={styles.receiptDivider} />
                    <Text style={styles.receiptSubtitle}>Fare Rates</Text>
                    {inspectionOverview.currentFareRates.map((fareInfo, index) => (
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
                onPress={() => setShowInspectionOverviewModal(false)}
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
  searchContainer: {
    width: '100%',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  receiptWrapper: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'stretch',
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

export default InspectionLogs;