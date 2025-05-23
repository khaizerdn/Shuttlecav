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
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
  },
  inputErrorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 10,
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
  // Updated delete button style with fixed width
  redListButton: {
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    minWidth: 60, // Minimum width of 60
    alignItems: 'center', // Center the text horizontally
  },
  blueListButton: {
    padding: 10,
    backgroundColor: '#3578E5',
    borderRadius: 5,
    minWidth: 60, // Minimum width of 60
    alignItems: 'center', // Center the text horizontally
  },
  listButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  // ===== Global List Styles =====
  listContainer: {
    flex: 1,
    width: '100%',
    minHeight: 200,
  },
  listItem: {
    width: '100%',
    backgroundColor: '#F2F2F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  listItemLeft: {
    flex: 1,
  },
  listItemLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listLeftBox: {
    width: 60,
    height: 60,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listLeftBoxSecondaryText: {
    fontSize: 12,
    color: '#000',
  },
  listLeftBoxPrimaryText: {
    fontSize: 16,
    color: '#000',
  },
  listLeftBoxText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
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
  listlocationContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  listItemSecondary: {
    fontSize: 16,
    color: '#e74c3c',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionAddIcon: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#3578E5',
  },
  // ===== Global Modal Styles =====
  modalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
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
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    gap: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDeleteTextLink: {
    color: '#3578E5',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    height: 50,
    maxHeight: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Separator
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#F2F2F2',
    marginVertical: 10,
  },
});

export default globalStyles;