import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function EventHistoryScreen() {
  const [pastEvents, setPastEvents] = useState([]);
  const [statistics, setStatistics] = useState({ totalEvents: 0, averageRating: 0 });

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'events'),
        where('date', '<', now.toISOString()),
        where('attendees', 'array-contains', auth.currentUser.uid),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPastEvents(events);

      // Calculate statistics
      const totalEvents = events.length;
      let totalRating = 0;
      let ratedEvents = 0;

      for (const event of events) {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('eventId', '==', event.id),
          where('userId', '==', auth.currentUser.uid)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        if (!commentsSnapshot.empty) {
          totalRating += commentsSnapshot.docs[0].data().rating;
          ratedEvents++;
        }
      }

      const averageRating = ratedEvents > 0 ? totalRating / ratedEvents : 0;

      setStatistics({ totalEvents, averageRating });
    } catch (error) {
      console.error('Error fetching past events:', error);
    }
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsTitle}>Estadísticas</Text>
        <Text style={styles.statisticsText}>Total de eventos asistidos: {statistics.totalEvents}</Text>
        <Text style={styles.statisticsText}>Calificación promedio: {statistics.averageRating.toFixed(1)}</Text>
      </View>
      <Text style={styles.historyTitle}>Historial de Eventos</Text>
      <FlatList
        data={pastEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No has asistido a ningún evento aún</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  statisticsContainer: {
    backgroundColor: '#EDF2F7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statisticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  statisticsText: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 5,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
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
  emptyText: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
});

