import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const HelpSlideshow = () => {
  const { role } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const images = role === 'inspector' ? [
    require('../assets/images/help/inspector/I12.png'),
    require('../assets/images/help/inspector/I13.png'),
    require('../assets/images/help/inspector/I14.png'),
    require('../assets/images/help/inspector/I15.png'),
    require('../assets/images/help/inspector/I16.png'),
    require('../assets/images/help/inspector/I17.png'),
    require('../assets/images/help/inspector/I18.png'),
    require('../assets/images/help/inspector/I19.png'),
    require('../assets/images/help/inspector/I20.png'),
    require('../assets/images/help/inspector/I21.png'),
    require('../assets/images/help/inspector/I22.png'),
    require('../assets/images/help/inspector/I23.png'),
    require('../assets/images/help/inspector/I24.png'),
    require('../assets/images/help/inspector/I25.png'),
    require('../assets/images/help/inspector/I26.png'),
    require('../assets/images/help/inspector/I27.png'),
    require('../assets/images/help/inspector/I28.png'),
    require('../assets/images/help/inspector/I29.png'),
  ] : role === 'admin' ? [
    require('../assets/images/help/admin/A30.png'),
    require('../assets/images/help/admin/A31.png'),
    require('../assets/images/help/admin/A32.png'),
    require('../assets/images/help/admin/A33.png'),
    require('../assets/images/help/admin/A34.png'),
    require('../assets/images/help/admin/A35.png'),
    require('../assets/images/help/admin/A36.png'),
    require('../assets/images/help/admin/A37.png'),
    require('../assets/images/help/admin/A38.png'),
    require('../assets/images/help/admin/A39.png'),
    require('../assets/images/help/admin/A40.png'),
    require('../assets/images/help/admin/A41.png'),
    require('../assets/images/help/admin/A42.png'),
    require('../assets/images/help/admin/A43.png'),
    require('../assets/images/help/admin/A44.png'),
    require('../assets/images/help/admin/A45.png'),
    require('../assets/images/help/admin/A46.png'),
    require('../assets/images/help/admin/A47.png'),
  ] : [
    require('../assets/images/help/user/P1.png'),
    require('../assets/images/help/user/P2.png'),
    require('../assets/images/help/user/P3.png'),
    require('../assets/images/help/user/P4.png'),
    require('../assets/images/help/user/P5.png'),
    require('../assets/images/help/user/P6.png'),
    require('../assets/images/help/user/P7.png'),
    require('../assets/images/help/user/P8.png'),
  ];

  const onMomentumScrollEnd = ({ nativeEvent }) => {
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image
        source={item}
        style={styles.slideImage}
        resizeMode="contain"
      />
    </View>
  );

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 0, animated: false });
    }
  }, [role]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate={0.8}
        scrollEventThrottle={16}
        initialScrollIndex={0}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      <View style={styles.pageIndicator}>
        <Text style={styles.pageText}>
          {currentIndex + 1}/{images.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    margin: 0,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideImage: {
    width,
    height,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  pageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
});

export default HelpSlideshow;