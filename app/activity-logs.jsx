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

const ActivityLogs = () => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('Per-Trip');
  const [sortOrder, setSortOrder] = useState(null); // null (default), 'asc', or 'desc'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspectionOverview, setInspectionOverview] = useState(null);
  const [showInspectionOverviewModal, setShowInspectionOverviewModal] = useState(false);

  // Helper to format datetime as "January 25, 2025 at 8:34 AM"
  const formatFullDate = (datetime) => {
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

  // Helper to format only the date as "February 28, 2025"
  const formatDateOnly = (datetime) => {
    const dateObj = new Date(datetime);
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Grouping helpers for filtering (Weekly, Monthly, Yearly)
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getMonthlyLabel = (dateObj) => {
    const month = fullMonths[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${month} ${year}`;
  };

  const getYearlyLabel = (dateObj) => {
    return dateObj.getFullYear().toString();
  };

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatShortDate = (d) => {
    const month = shortMonths[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const getSundaySaturdayRangeLabel = (dateObj) => {
    const temp = new Date(dateObj);
    const dayOfWeek = temp.getDay();
    temp.setDate(temp.getDate() - dayOfWeek);
    const sunday = new Date(temp);
    const saturday = new Date(temp);
    saturday.setDate(saturday.getDate() + 6);
    const startLabel = formatShortDate(sunday);
    const endLabel = formatShortDate(saturday);
    return `${startLabel} - ${endLabel}`;
  };

  // Fetch activity logs from the API endpoint
  const fetchActivityLogs = async () => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${config.API_URL}/activity-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      } else {
        console.error('Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchActivityLogs();
  };

  // Fetch detailed inspection data for the receipt modal
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
    fetchActivityLogs();
  }, []);

  // Filter logs based on search text using the formatted date, driver, or total claimed money
  const filteredLogs = activityLogs.filter((log) => {
    const lowerSearch = searchText.toLowerCase();
    const formattedDate = formatFullDate(log.start_datetime);
    return (
      formattedDate.toLowerCase().includes(lowerSearch) ||
      (log.driver && log.driver.toLowerCase().includes(lowerSearch)) ||
      (log.total_claimed_money &&
        log.total_claimed_money.toString().toLowerCase().includes(lowerSearch))
    );
  });

  // Group logs based on the selected filter type and apply sorting
  const getFilteredLogs = () => {
    let logs;
    if (filterType === 'Per-Trip') {
      logs = filteredLogs.map(log => ({
        id: log.id,
        date: formatFullDate(log.start_datetime),
        driver: log.driver,
        plate: log.plate,
        inspector: log.inspector_fullname,
        route: log.origin && log.destination ? `${log.origin} to ${log.destination}` : '',
        totalClaimed: parseFloat(log.total_claimed_money).toFixed(2),
      }));
    } else {
      const groupedMap = new Map();
      filteredLogs.forEach((log) => {
        const dateObj = new Date(log.start_datetime);
        const claimed = parseFloat(log.total_claimed_money);
        let groupKey = '';
        let displayDate = '';
        switch (filterType) {
          case 'Daily':
            groupKey = formatDateOnly(log.start_datetime);
            displayDate = formatDateOnly(log.start_datetime);
            break;
          case 'Weekly': {
            const temp = new Date(dateObj);
            const dayOfWeek = temp.getDay();
            temp.setDate(temp.getDate() - dayOfWeek);
            groupKey = temp.toISOString().substring(0, 10);
            displayDate = getSundaySaturdayRangeLabel(dateObj);
            break;
          }
          case 'Monthly': {
            const monthLabel = getMonthlyLabel(dateObj);
            groupKey = monthLabel;
            displayDate = monthLabel;
            break;
          }
          case 'Yearly': {
            const yearLabel = getYearlyLabel(dateObj);
            groupKey = yearLabel;
            displayDate = yearLabel;
            break;
          }
          default:
            break;
        }
        if (!groupedMap.has(groupKey)) {
          groupedMap.set(groupKey, {
            id: groupKey,
            date: displayDate,
            totalClaimed: claimed,
            driver: '',
            plate: '',
            inspector: '',
            route: '',
          });
        } else {
          const existing = groupedMap.get(groupKey);
          existing.totalClaimed += claimed;
        }
      });
      logs = Array.from(groupedMap.values()).map((item) => ({
        ...item,
        totalClaimed: item.totalClaimed.toFixed(2),
      }));
    }

    // Apply sorting based on totalClaimed
    if (sortOrder === 'asc') {
      return logs.sort((a, b) => parseFloat(a.totalClaimed) - parseFloat(b.totalClaimed));
    } else if (sortOrder === 'desc') {
      return logs.sort((a, b) => parseFloat(b.totalClaimed) - parseFloat(a.totalClaimed));
    }
    return logs; // Default order (no sorting)
  };

  const finalLogs = getFilteredLogs();

  const handleFilterSelect = (type) => {
    setFilterType(type);
    setSortOrder(null); // Reset sort order when changing filter type
    setShowFilterModal(false);
  };

  const handleSortSelect = (order) => {
    setSortOrder(order);
    setShowFilterModal(false);
  };

  const handleLogPress = (item) => {
    if (filterType === 'Per-Trip') {
      fetchInspectionDetails(item.id);
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
      {/* Search + Filter Button Row */}
      <View style={styles.searchFilterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Logs List */}
      <View style={globalStyles.listContainer}>
        <FlatList
          data={finalLogs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={globalStyles.listItem}
              onPress={() => handleLogPress(item)}
            >
              <View style={globalStyles.listItemLeft}>
                <Text style={globalStyles.listItemPrimary}>{item.date}</Text>
                {filterType === 'Per-Trip' && (
                  <>
                    <Text style={globalStyles.listItemDate}>Driver: {item.driver}</Text>
                    <Text style={globalStyles.listItemDate}>Inspector: {item.inspector}</Text>
                    <Text style={globalStyles.listItemDate}>Plate: {item.plate}</Text>
                    <Text style={globalStyles.listItemDate}>Route: {item.route}</Text>
                  </>
                )}
              </View>
              <View style={globalStyles.listItemRight}>
                <Text style={[globalStyles.listItemSecondary, { color: '#3578E5' }]}>
                  + {item.totalClaimed}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>

      {/* Modal for Filter and Sort Options */}
      <Modal visible={showFilterModal} transparent animationType="none">
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Filter</Text>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => handleFilterSelect('Per-Trip')}
            >
              <Text style={globalStyles.buttonText}>Per-Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => handleFilterSelect('Daily')}
            >
              <Text style={globalStyles.buttonText}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => handleFilterSelect('Weekly')}
            >
              <Text style={globalStyles.buttonText}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => handleFilterSelect('Monthly')}
            >
              <Text style={globalStyles.buttonText}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => handleFilterSelect('Yearly')}
            >
              <Text style={globalStyles.buttonText}>Yearly</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <Text style={globalStyles.modalTitle}>Sort by Total Claimed Money</Text>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => handleSortSelect('asc')}
            >
              <Text style={globalStyles.buttonText}>Ascending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.button}
              onPress={() => handleSortSelect('desc')}
            >
              <Text style={globalStyles.buttonText}>Descending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={globalStyles.cancelButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={globalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                    {formatFullDate(inspectionOverview?.start_datetime)}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>End Date:</Text>
                  <Text style={styles.receiptValue}>
                    {inspectionOverview?.end_datetime
                      ? formatFullDate(inspectionOverview.end_datetime)
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

export default ActivityLogs;

const styles = StyleSheet.create({
  searchFilterRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#3578E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 10,
  },
  filterButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
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
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
  },
});