import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { signOut } from '@firebase/auth';
import { collection, query, orderBy, limit, getDocs } from '@firebase/firestore';
import { auth, db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'asc'), limit(3));
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Eventos Comunitarios</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos Eventos</Text>
        <FlatList
          data={upcomingEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay eventos próximos</Text>}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EventList')}>
          <Ionicons name="list-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Ver Todos los Eventos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateEvent')}>
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Crear Evento</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
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
    textAlign: 'center',
    color: '#2D3748',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4A5568',
  },
  eventItem: {
    backgroundColor: '#EDF2F7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  eventDate: {
    fontSize: 14,
    color: '#4A5568',
  },
  emptyText: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4299E1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  logoutButton: {
    backgroundColor: '#F56565',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

