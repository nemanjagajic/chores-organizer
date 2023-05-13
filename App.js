import { Button, StyleSheet, Text, View, Dimensions, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { useState, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';

export default function App() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [choreName, setChoreName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [chores, setChores] = useState([]);
  const [isConfirmRemovalModalVisible, setConfirmRemovalModalVisible] = useState(false);
  const [isConfirmCompletionModalVisible, setConfirmCompletionModalVisible] = useState(false);
  const [choreIdToRemove, setChoreIdToRemove] = useState(null)
  const [choreIdToComplete, setChoreIdToComplete] = useState(null)

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
        lastCompleted: ''
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

  const renderItem = ({ item, index }) => (
    <View style={[
      styles.choreItem,
      index === 0 && styles.choreItemFirst,
      index === chores.length - 1 && styles.choreItemLast
    ]}>
      <View style={styles.choreItemLeft}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemLineWrapper}>
          <Text style={styles.itemDescription}>Complete in: </Text>
          <Text style={[styles.itemDescription, styles.timeIndicator]}>{getDaysLeft(item.lastCompleted, item.frequency)} days</Text>
        </View>
        <View style={styles.itemLineWrapper}>
          <Text style={styles.itemDescription}>Last completed: </Text>
          <Text style={[styles.itemDescription, styles.timeIndicator]}>{getTimeAgo(item.lastCompleted)}</Text>
        </View>
        <Text style={styles.itemFrequency}>every {item.frequency} days</Text>
      </View>
      <View style={styles.choreItemRight}>
        <TouchableOpacity
          style={[styles.menuButton, styles.checkButton]}
          onPress={() => {
            setChoreIdToComplete(item.id)
            toggleConfirmCompletionModal()
          }}
        >
          <MaterialIcons name="check" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            setChoreIdToRemove(item.id)
            toggleConfirmRemovalModal()
          }}
        >
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const onRemove = async (choreId) => {
    const updatedChores = chores.filter((chore) => chore.id !== choreId);
    await AsyncStorage.setItem('chores', JSON.stringify(updatedChores));
    setChores(updatedChores);
  };

  const onComplete = async (choreId) => {
    const updatedChores = chores.map((chore) => {
      if (chore.id === choreId) {
        return {...chore, lastCompleted: moment.now()}
      }
      return chore
    });
    await AsyncStorage.setItem('chores', JSON.stringify(updatedChores));
    setChores(updatedChores);
  };

  const toggleConfirmRemovalModal = () => {
    setConfirmRemovalModalVisible(!isConfirmRemovalModalVisible);
  };

  const toggleConfirmCompletionModal = () => {
    setConfirmCompletionModalVisible(!isConfirmCompletionModalVisible);
  };

  const handleRemove = () => {
    onRemove(choreIdToRemove);
    toggleConfirmRemovalModal();
  };

  const handleComplete = () => {
    onComplete(choreIdToComplete);
    toggleConfirmCompletionModal()
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never'

    const currentTime = moment().startOf('day');
    const passedTime = moment(timestamp).startOf('day');

    // Check if current time and passed time are on the same day
    if (currentTime.isSame(passedTime, 'day')) {
      return 'Today';
    }

    // Check if current time minus passed time equals yesterday
    if (currentTime.diff(passedTime, 'days') === 1) {
      return 'Yesterday';
    }

    // Calculate the number of days ago
    const daysAgo = currentTime.diff(passedTime, 'days');
    return `${daysAgo + 1} days ago`;
  }

  const getDaysLeft = (timestamp, frequency) => {
    if (!timestamp) return '/'
    const currentTime = moment().startOf('day');
    const targetDate = moment(timestamp).startOf('day').add(frequency, 'days');

    return targetDate.diff(currentTime, 'days');
  }

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
        contentContainerStyle={styles.choresList}
      />
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onSwipeComplete={toggleModal}
        swipeDirection={['down']}
        style={styles.modalContainer}
        avoidKeyboard={true}
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
            onChangeText={text => {
              if (!isNaN(text)) {
                setFrequency(text)
              }
            }}
            value={frequency}
          />
          <TouchableOpacity style={styles.addButton} onPress={addChore}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal isVisible={isConfirmCompletionModalVisible} onBackdropPress={toggleConfirmCompletionModal}>
        <View style={styles.confirmModalView}>
          <Text style={styles.confirmModalTitle}>Complete this item?</Text>
          <View style={styles.confirmModalButtonContainer}>
            <TouchableOpacity style={[styles.confirmModalButton, styles.confirmModalCancelButton]} onPress={toggleConfirmCompletionModal}>
              <Text style={styles.confirmModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmModalButton, styles.confirmModalDeleteButton, styles.completeButton]}
              onPress={handleComplete}
            >
              <Text style={styles.confirmModalButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#26A69A',
    borderRadius: 10,
    padding: 10,
    minWidth: 100,
    minHeight: 45
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
    marginTop: 20,
    marginBottom: 30
  },
  choresList: {
    display: "flex",
    alignItems: "center",
    width: '100%',
  },
  choreItem: {
    flexDirection: "row",
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
  },
  itemName: {
    fontSize: 20,
    color: '#555',
    fontWeight: 'bold',
    flex: 1,
    marginBottom: 12
  },
  itemDescription: {
    fontSize: 16,
    color: '#8c8c8c',
    textAlign: 'left',
    marginVertical: 2
  },
  itemFrequency: {
    fontSize: 14,
    color: '#8c8c8c',
    textAlign: 'left',
    marginTop: 10
  },
  menuButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
    borderRadius: 20,
    marginLeft: 10,
    width: 40,
    height: 40,
    marginTop: 2,
    marginBottom: 2
  },
  checkButton: {
    backgroundColor: '#26A69A',
    marginBottom: 10
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
  choreItemLeft: {
    flexDirection: "column",
    width: "80%"
  },
  choreItemRight: {
    display: "flex",
    width: "20%",
    alignItems: "flex-end",
    flexDirection: "column",
  },
  choreItemFirst: {
    marginTop: 20
  },
  choreItemLast: {
    marginBottom: 30
  },
  completeButton: {
    backgroundColor: "#26A69A"
  },
  itemLineWrapper: {
    display: "flex",
    flexDirection: "row"
  },
  timeIndicator: {
    fontWeight: "bold"
  }
});
