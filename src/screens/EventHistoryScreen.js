import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function EventHistoryScreen({ navigation }) {
  const [pastEvents, setPastEvents] = useState([]);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const userId = auth.currentUser.uid;
      const now = new Date().toISOString();
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('attendees', 'array-contains', userId),
        where('status', '==', 'finished'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPastEvents(events);
    } catch (error) {
      console.error('Error fetching past events:', error);
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <View style={styles.eventInfo}>
        <Ionicons name="location-outline" size={16} color="#4A5568" />
        <Text style={styles.eventLocation}>{item.location}</Text>
      </View>
      <Text style={styles.attendeesCount}>Asistentes: {item.attendees.length}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Eventos</Text>
      {pastEvents.length > 0 ? (
        <FlatList
          data={pastEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.emptyText}>No has asistido a ningún evento finalizado aún.</Text>
      )}
    </View>
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
  eventItem: {
    backgroundColor: '#EDF2F7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  eventDate: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 5,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 5,
  },
  attendeesCount: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 5,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontStyle: 'italic',
    marginTop: 20,
  },
});

