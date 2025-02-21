import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import globalStyles from './globalstyles';

const ActivityLogs = () => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('Per-Trip');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const activityLogs = [
    { id: '1', date: 'January 20, 2025', actPlateNumber: 'ABC-1234', totalClaimed: '50.00' },
    { id: '2', date: 'January 19, 2025', actPlateNumber: 'DEF-5678', totalClaimed: '75.00' },
    { id: '3', date: 'January 18, 2025', actPlateNumber: 'GHI-9012', totalClaimed: '100.00' },
    { id: '4', date: 'January 17, 2025', actPlateNumber: 'JKL-3456', totalClaimed: '60.00' },
    { id: '5', date: 'January 16, 2025', actPlateNumber: 'MNO-7890', totalClaimed: '80.00' },
    { id: '6', date: 'January 15, 2025', actPlateNumber: 'PQR-2345', totalClaimed: '55.00' },
    { id: '7', date: 'January 14, 2025', actPlateNumber: 'STU-6789', totalClaimed: '90.00' },
    { id: '8', date: 'January 13, 2025', actPlateNumber: 'VWX-0123', totalClaimed: '70.00' },
    { id: '9', date: 'January 12, 2025', actPlateNumber: 'YZA-4567', totalClaimed: '65.00' },
    { id: '10', date: 'January 11, 2025', actPlateNumber: 'BCD-8910', totalClaimed: '85.00' },
    { id: '11', date: 'January 10, 2025', actPlateNumber: 'EFG-2345', totalClaimed: '50.00' },
    { id: '12', date: 'January 09, 2025', actPlateNumber: 'HIJ-6789', totalClaimed: '75.00' },
    { id: '13', date: 'January 08, 2025', actPlateNumber: 'KLM-0123', totalClaimed: '100.00' },
    { id: '14', date: 'January 07, 2025', actPlateNumber: 'NOP-4567', totalClaimed: '60.00' },
    { id: '15', date: 'January 06, 2025', actPlateNumber: 'QRS-8910', totalClaimed: '80.00' },
    { id: '16', date: 'January 05, 2025', actPlateNumber: 'TUV-2345', totalClaimed: '55.00' },
    { id: '17', date: 'January 04, 2025', actPlateNumber: 'WXY-6789', totalClaimed: '90.00' },
    { id: '18', date: 'January 03, 2025', actPlateNumber: 'ZAB-0123', totalClaimed: '70.00' },
    { id: '19', date: 'January 02, 2025', actPlateNumber: 'CDE-4567', totalClaimed: '65.00' },
    { id: '20', date: 'January 01, 2025', actPlateNumber: 'FGH-8910', totalClaimed: '85.00' },
  ];

  // --- Helper functions for date parsing and grouping ---

  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const parseDate = (dateStr) => {
    const [monthName, dayWithComma, yearStr] = dateStr.split(' ');
    const day = parseInt(dayWithComma.replace(',', ''), 10);
    const year = parseInt(yearStr, 10);
    const monthIndex = fullMonths.indexOf(monthName);
    if (monthIndex === -1) {
      return new Date(dateStr);
    }
    return new Date(year, monthIndex, day);
  };

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

  const filteredLogs = activityLogs.filter((item) => {
    const lowerSearch = searchText.toLowerCase();
    return (
      item.date.toLowerCase().includes(lowerSearch) ||
      item.actPlateNumber.toLowerCase().includes(lowerSearch) ||
      item.totalClaimed.toLowerCase().includes(lowerSearch)
    );
  });

  const getFilteredLogs = () => {
    if (filterType === 'Per-Trip') {
      return filteredLogs;
    }
    const groupedMap = new Map();
    filteredLogs.forEach((log) => {
      const dateObj = parseDate(log.date);
      const claimed = parseFloat(log.totalClaimed);
      let groupKey = '';
      let displayDate = '';
      switch (filterType) {
        case 'Daily':
          groupKey = log.date;
          displayDate = log.date;
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
          actPlateNumber: '',
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={globalStyles.listItem}>
              <View style={globalStyles.listItemLeft}>
                <Text style={globalStyles.listItemDate}>{item.date}</Text>
                {filterType === 'Per-Trip' && (
                  <Text style={globalStyles.listItemPrimary}>
                    {item.actPlateNumber}
                  </Text>
                )}
              </View>
              <View style={globalStyles.listItemRight}>
                <Text style={globalStyles.listItemSecondary}>
                  {item.totalClaimed}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Modal for Filter Options using global modal styles */}
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

            <TouchableOpacity style={globalStyles.cancelButton} onPress={() => setShowFilterModal(false)}>
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
