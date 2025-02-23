// NfcDisabledModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import globalStyles from './globalstyles';

const NfcDisabledModal = ({ visible, onEnable, onCancel }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={globalStyles.modalOverlay}>
        <View style={globalStyles.modalContainer}>
          <Text style={globalStyles.modalTitle}>NFC Disabled</Text>
          <Text style={globalStyles.modalText}>
            Would you like to enable it?
          </Text>
          <View style={globalStyles.modalButtons}>
            <TouchableOpacity
              style={[globalStyles.actionButton, { backgroundColor: '#e74c3c' }]}
              onPress={onCancel}
            >
              <Text style={globalStyles.actionButtonText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.actionButton, { backgroundColor: '#3578E5' }]}
              onPress={onEnable}
            >
              <Text style={globalStyles.actionButtonText}>Yes</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NfcDisabledModal;
