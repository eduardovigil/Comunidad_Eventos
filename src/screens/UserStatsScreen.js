import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function UserStatsScreen() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    averageRating: 0,
    totalComments: 0,
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const userId = auth.currentUser.uid;
      const now = new Date().toISOString();
      const eventsRef = collection(db, 'events');
      
      const pastEventsQuery = query(
        eventsRef,
        where('attendees', 'array-contains', userId),
        where('date', '<', now)
      );
      const upcomingEventsQuery = query(
        eventsRef,
        where('attendees', 'array-contains', userId),
        where('date', '>=', now)
      );

      const [pastEventsSnapshot, upcomingEventsSnapshot] = await Promise.all([
        getDocs(pastEventsQuery),
        getDocs(upcomingEventsQuery)
      ]);

      const pastEvents = pastEventsSnapshot.docs;
      const upcomingEvents = upcomingEventsSnapshot.docs;

      let totalRating = 0;
      let totalComments = 0;

      pastEvents.forEach(doc => {
        const eventData = doc.data();
        if (eventData.comments) {
          totalComments += eventData.comments.length;
          totalRating += eventData.comments.reduce((sum, comment) => sum + comment.rating, 0);
        }
      });

      const averageRating = totalRating / totalComments || 0;

      setStats({
        totalEvents: pastEvents.length + upcomingEvents.length,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        averageRating: averageRating.toFixed(1),
        totalComments,
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tus Estadísticas</Text>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Total de Eventos:</Text>
        <Text style={styles.statValue}>{stats.totalEvents}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Eventos Próximos:</Text>
        <Text style={styles.statValue}>{stats.upcomingEvents}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Eventos Pasados:</Text>
        <Text style={styles.statValue}>{stats.pastEvents}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Calificación Promedio:</Text>
        <Text style={styles.statValue}>{stats.averageRating}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Total de Comentarios:</Text>
        <Text style={styles.statValue}>{stats.totalComments}</Text>
      </View>
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
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#4A5568',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
});

