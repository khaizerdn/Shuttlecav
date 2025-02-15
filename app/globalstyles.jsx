import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    padding: 20,
  },
  // Other global styles (inputs, buttons, etc.)
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
  linkText: {
    fontSize: 16,
    color: '#3578E5',
    textAlign: 'center',
    marginTop: 10,
  },
  // ===== Travel History Shared Styles =====
  travelHistoryContainer: {
    flex: 1,
    width: '100%',
  },
  travelHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    width: '100%',
  },
  travelHistoryItem: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  travelHistoryLeft: {
    flex: 1,
  },
  travelHistoryRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  travelHistoryDate: {
    fontSize: 14,
    color: '#777',
  },
  travelHistoryRoute: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  travelHistoryAmount: {
    fontSize: 16,
    color: '#e74c3c',
  },
});

export default globalStyles;
