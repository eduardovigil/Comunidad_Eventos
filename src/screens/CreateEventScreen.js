import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateEvent = async () => {
    if (!title || !date || !location || !description) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'events'), {
        title,
        date: date.toISOString(),
        location,
        description,
        createdAt: new Date().toISOString(),
      });
      console.log('Evento creado con ID: ', docRef.id);
      Alert.alert('Éxito', 'Evento creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error al crear el evento: ', error);
      Alert.alert('Error', 'No se pudo crear el evento. Por favor, intenta de nuevo.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Nuevo Evento</Text>
      
      <View style={styles.inputContainer}>
        <Ionicons name="pencil-outline" size={24} color="#4A5568" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Título del evento"
          value={title}
          onChangeText={setTitle}
        />
      </View>
      
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Ionicons name="calendar-outline" size={24} color="#4A5568" style={styles.icon} />
        <Text style={styles.datePickerButtonText}>
          {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={24} color="#4A5568" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ubicación"
          value={location}
          onChangeText={setLocation}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Ionicons name="document-text-outline" size={24} color="#4A5568" style={styles.icon} />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Descripción"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>
      
      <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
        <Text style={styles.buttonText}>Crear Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2D3748',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#2D3748',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 10,
    height: 50,
  },
  datePickerButtonText: {
    flex: 1,
    color: '#2D3748',
  },
  button: {
    backgroundColor: '#4299E1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

