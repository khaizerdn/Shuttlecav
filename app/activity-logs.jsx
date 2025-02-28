import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import globalStyles from './globalstyles';

const ActivityLogs = () => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('Per-Trip');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Grouping helpers for filtering (Daily, Weekly, Monthly, Yearly)
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
        // Data is expected to be an array of inspection records.
        setActivityLogs(data);
      } else {
        console.error('Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // Filter logs based on search text using the formatted date, driver, or total claimed money.
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

  // Group logs based on the selected filter type.
  // For "Per-Trip", include driver, plate, inspector, and now the route.
  const getFilteredLogs = () => {
    if (filterType === 'Per-Trip') {
      return filteredLogs.map(log => ({
        id: log.id,
        date: formatFullDate(log.start_datetime),
        driver: log.driver,
        plate: log.plate,
        inspector: log.inspector_fullname,
        // Build the route string from origin and destination.
        route: log.origin && log.destination ? `${log.origin} to ${log.destination}` : '',
        totalClaimed: parseFloat(log.total_claimed_money).toFixed(2)
      }));
    }
    const groupedMap = new Map();
    filteredLogs.forEach((log) => {
      const dateObj = new Date(log.start_datetime);
      const claimed = parseFloat(log.total_claimed_money);
      let groupKey = '';
      let displayDate = '';
      switch (filterType) {
        case 'Daily':
          groupKey = formatFullDate(log.start_datetime);
          displayDate = formatFullDate(log.start_datetime);
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
          // In grouped view, driver/plate/inspector/route are not applicable.
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
    return Array.from(groupedMap.values()).map((item) => ({
      ...item,
      totalClaimed: item.totalClaimed.toFixed(2),
    }));
  };

  const finalLogs = getFilteredLogs();

  const handleFilterSelect = (type) => {
    setFilterType(type);
    setShowFilterModal(false);
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
            <View style={globalStyles.listItem}>
              <View style={globalStyles.listItemLeft}>
                <Text style={globalStyles.listItemPrimary}>{item.date}</Text>
                {filterType === 'Per-Trip' && (
                  <>
                    <Text style={globalStyles.listItemDate}>Driver: {item.driver}</Text>
                    <Text style={globalStyles.listItemDate}>Inspector: {item.inspector}</Text>
                    <Text style={globalStyles.listItemDate}>Plate: {item.plate}</Text>
                    {/* New row to display the route below the plate */}
                    <Text style={globalStyles.listItemDate}>Route: {item.route}</Text>
                  </>
                )}
              </View>
              <View style={globalStyles.listItemRight}>
                <Text style={[globalStyles.listItemSecondary, { color: '#3578E5' }]}>
                  + {item.totalClaimed}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Modal for Filter Options */}
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

            <TouchableOpacity
              style={globalStyles.cancelButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={globalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
});
