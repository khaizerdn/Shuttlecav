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
    backgroundColor: '#e74c3c', // Blue color matching globalStyles.button
    borderRadius: 5,
    width: 60, // Fixed width to prevent stretching
    alignItems: 'center', // Center the text horizontally
  },
  blueListButton: {
    padding: 10,
    backgroundColor: '#3578E5', // Blue color matching globalStyles.button
    borderRadius: 5,
    width: 60, // Fixed width to prevent stretching
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
    backgroundColor: '#EAEAEA',
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
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
    padding: 10,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#EAEAEA',
    marginVertical: 10,
  },
});

export default globalStyles;