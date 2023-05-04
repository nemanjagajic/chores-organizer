import { Button, StyleSheet, Text, View, Dimensions, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { useState, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [choreName, setChoreName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [chores, setChores] = useState([]);
  const [isConfirmRemovalModalVisible, setConfirmRemovalModalVisible] = useState(false);
  const [choreIdToRemove, setChoreIdToRemove] = useState(null)

  useEffect(() => {
    getChores();
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const addChore = async () => {
    if (!choreName || !frequency) return;
    try {
      const newChore = {
        id: new Date().getTime().toString(),
        name: choreName,
        frequency: frequency,
      };
      const updatedChores = [...chores, newChore];
      await AsyncStorage.setItem('chores', JSON.stringify(updatedChores));
      setChores(updatedChores);
      setChoreName('');
      setFrequency('');
      toggleModal();
    } catch (error) {
      console.error(error);
    }
  };

  const getChores = async () => {
    try {
      const chores = await AsyncStorage.getItem('chores');
      if (chores) {
        setChores(JSON.parse(chores));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.choreItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemFrequency}>{item.frequency} days</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          setChoreIdToRemove(item.id)
          toggleConfirmRemovalModal()
        }}
      >
        <MaterialIcons name="delete" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const onRemove = async (choreId) => {
    const updatedChores = chores.filter((i) => i.id !== choreId);
    await AsyncStorage.setItem('chores', JSON.stringify(updatedChores));
    setChores(updatedChores);
  };

  const toggleConfirmRemovalModal = () => {
    setConfirmRemovalModalVisible(!isConfirmRemovalModalVisible);
  };

  const handleRemove = () => {
    onRemove(choreIdToRemove);
    toggleConfirmRemovalModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chores</Text>
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <Text style={styles.addButtonText}>Add Chore</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={chores}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.choresList}
      />
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
          <TextInput
            style={styles.input}
            placeholder="Name of chore"
            onChangeText={text => setChoreName(text)}
            value={choreName}
          />
          <TextInput
            style={styles.input}
            placeholder="Frequency in days"
            keyboardType="numeric"
            onChangeText={text => setFrequency(text)}
            value={frequency}
          />
          <TouchableOpacity style={styles.addButton} onPress={addChore}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal isVisible={isConfirmRemovalModalVisible} onBackdropPress={toggleConfirmRemovalModal}>
        <View style={styles.confirmModalView}>
          <Text style={styles.confirmModalTitle}>Are you sure you want to delete this item?</Text>
          <View style={styles.confirmModalButtonContainer}>
            <TouchableOpacity style={[styles.confirmModalButton, styles.confirmModalCancelButton]} onPress={toggleConfirmRemovalModal}>
              <Text style={styles.confirmModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmModalButton, styles.confirmModalDeleteButton]}
              onPress={handleRemove}
            >
              <Text style={styles.confirmModalButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
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
  },
  choresList: {
    flex: 1,
    width: '90%',
    marginTop: 20,
  },
  choreItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 20,
    color: '#555',
    fontWeight: 'bold',
    flex: 1,
  },
  itemFrequency: {
    fontSize: 16,
    color: '#aaa',
    flex: 1,
    textAlign: 'right',
  },
  removeButton: {
    backgroundColor: "red",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  confirmModalView: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  confirmModalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  confirmModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  confirmModalCancelButton: {
    backgroundColor: "#ccc",
  },
  confirmModalDeleteButton: {
    backgroundColor: "red",
  },
  confirmModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
