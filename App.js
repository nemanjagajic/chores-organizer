import { Button, StyleSheet, Text, View, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { useState } from "react"

export default function App() {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chores</Text>
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <Text style={styles.addButtonText}>Add Chore</Text>
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onSwipeComplete={toggleModal}
        swipeDirection={['down']}
        style={styles.modalContainer}
      >
        <View style={styles.modalView}>
          <View style={styles.dragIndicator} />
          <Text style={styles.modalTitle}>Add Chore</Text>
          <TextInput style={styles.input} placeholder="Name of chore" />
          <TextInput style={styles.input} placeholder="Frequency in days" keyboardType="numeric" />
        </View>
      </Modal>
    </View>
  );
}

const { height, width } = Dimensions.get('window');
const modalHeight = height * 0.5;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: modalHeight,
    height: modalHeight,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 30
  },
  dragIndicator: {
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: '#dcdcdc',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    margin: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    width: '100%',
    padding: 10,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#26A69A',
    borderRadius: 5,
    padding: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: '90%',
    fontSize: 18,
    color: '#444',
    marginTop: 40
  }
});
