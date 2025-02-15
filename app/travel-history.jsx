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
      <TextInput
        style={globalStyles.input}
        placeholder="Search"
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Travel History List */}
      <View style={globalStyles.listContainer}>
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={globalStyles.listItem}>
              <View style={globalStyles.listItemLeft}>
                <Text style={globalStyles.listItemDate}>{item.date}</Text>
                <Text style={globalStyles.listItemPrimary}>{item.route}</Text>
              </View>
              <View style={globalStyles.listItemRight}>
                <Text style={globalStyles.listItemSecondary}>{item.amount}</Text>
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

export default TravelHistory;
