import React, { useState } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import globalStyles from './globalstyles';

const TravelHistory = () => {
  const [searchText, setSearchText] = useState('');

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
    { id: '11', date: 'January 20, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '12', date: 'January 19, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '13', date: 'January 18, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '14', date: 'January 17, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '15', date: 'January 16, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '16', date: 'January 20, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '17', date: 'January 19, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '18', date: 'January 18, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '19', date: 'January 17, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
    { id: '20', date: 'January 16, 2025', route: 'Carmona Estates to Waltermart', amount: '- 15.00' },
  ];

  // Filter travel history based on search text
  const filteredHistory = travelHistory.filter((item) => {
    const lowerSearch = searchText.toLowerCase();
    return (
      item.date.toLowerCase().includes(lowerSearch) ||
      item.route.toLowerCase().includes(lowerSearch) ||
      item.amount.toLowerCase().includes(lowerSearch)
    );
  });

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

      {/* Travel History List */}
      <View style={styles.historyContainer}>
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.leftColumn}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyRoute}>{item.route}</Text>
              </View>
              <View style={styles.rightColumn}>
                <Text style={styles.historyAmount}>{item.amount}</Text>
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
  historyContainer: {
    flex: 1,
    width: '100%',
  },
  historyItem: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  },
};

export default TravelHistory;
