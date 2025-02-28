import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';
import globalStyles from './globalstyles';

const InspectionLogs = () => {
  const [searchText, setSearchText] = useState('');
  const [inspectionLogs, setInspectionLogs] = useState([]);
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
            <View style={globalStyles.listItem}>
              <View style={globalStyles.listItemLeft}>
                <Text style={globalStyles.listItemPrimary}>
                  {formatDate(item.start_datetime)}
                </Text>
                <Text style={globalStyles.listItemDate}>Driver: {item.driver}</Text>
                <Text style={globalStyles.listItemDate}>Plate: {item.plate}</Text>
                {/* New row to display the route below the plate */}
                <Text style={globalStyles.listItemDate}>
                  Route: {item.origin} to {item.destination}
                </Text>
              </View>
              <View style={globalStyles.listItemRight}>
                <Text style={[globalStyles.listItemSecondary, { color: '#3578E5' }]}>
                  + {item.total_claimed_money}
                </Text>
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

const styles = {
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
};

export default InspectionLogs;
