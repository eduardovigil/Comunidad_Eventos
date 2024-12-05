import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetailsScreen({ route, navigation }) {
  const [event, setEvent] = useState(null);
  const { eventId } = route.params;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          Alert.alert('Error', 'Evento no encontrado');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Error', 'No se pudo cargar el evento');
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleDeleteEvent = async () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', eventId));
              Alert.alert('Éxito', 'Evento eliminado correctamente');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'No se pudo eliminar el evento');
            }
          }
        },
      ]
    );
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <View style={styles.infoContainer}>
        <Ionicons name="calendar-outline" size={20} color="#4A5568" />
        <Text style={styles.infoText}>{new Date(event.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Ionicons name="location-outline" size={20} color="#4A5568" />
        <Text style={styles.infoText}>{event.location}</Text>
      </View>
      <Text style={styles.description}>{event.description}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
        <Ionicons name="trash-outline" size={24} color="white" />
        <Text style={styles.deleteButtonText}>Eliminar Evento</Text>
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 10,
  },
  description: {
    fontSize: 16,
    color: '#2D3748',
    marginTop: 20,
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: '#F56565',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

