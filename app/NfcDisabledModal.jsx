// NfcDisabledModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import globalStyles from './globalstyles';

const NfcDisabledModal = ({ visible, onEnable, onCancel }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Your NFC is disabled. Would you like to enable it?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[globalStyles.button, { backgroundColor: 'red', width: 100 }]}
              onPress={onCancel}
            >
              <Text style={globalStyles.buttonText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.button, { width: 100 }]}
              onPress={onEnable}
            >
              <Text style={globalStyles.buttonText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 250,
  },
});

export default NfcDisabledModal;
