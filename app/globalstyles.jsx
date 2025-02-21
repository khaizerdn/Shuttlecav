import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3578E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // New global style for a cancel button with a red background.
  cancelButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 16,
    color: '#3578E5',
    textAlign: 'center',
    marginTop: 10,
  },

  // ===== Global List Styles =====
  listContainer: {
    flex: 1,
    width: '100%',
    minHeight: 200,
  },
  listItem: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  listItemLeft: {
    flex: 1,
  },
  listItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  listItemDate: {
    fontSize: 14,
    color: '#777',
  },
  listItemPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItemSecondary: {
    fontSize: 16,
    color: '#e74c3c',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    width: '100%',
  },

  // ===== Global Modal Styles =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default globalStyles;
