import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { signOut } from '@firebase/auth';
import { auth } from '../../firebase';

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>
      <Text style={styles.subtitle}>You've successfully logged in.</Text>
      <Button title="Go to Events" onPress={() => navigation.navigate('EventList')} />
      <Button title="Create Event" onPress={() => navigation.navigate('CreateEvent')} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
  },
});

