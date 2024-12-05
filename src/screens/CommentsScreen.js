import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function CommentsScreen({ route }) {
  const { eventId } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('eventId', '==', eventId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedComments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'No se pudieron cargar los comentarios');
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '' || rating === 0) {
      Alert.alert('Error', 'Por favor, escribe un comentario y selecciona una calificación');
      return;
    }

    try {
      await addDoc(collection(db, 'comments'), {
        eventId,
        userId: auth.currentUser.uid,
        text: newComment,
        rating,
        createdAt: new Date().toISOString(),
      });
      setNewComment('');
      setRating(0);
      fetchComments();
      Alert.alert('Éxito', 'Comentario añadido correctamente');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'No se pudo añadir el comentario');
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentText}>{item.text}</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= item.rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay comentarios aún</Text>}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un comentario..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={24}
                color="#FFD700"
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
          <Text style={styles.submitButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  commentItem: {
    backgroundColor: '#EDF2F7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  commentText: {
    fontSize: 16,
    color: '#2D3748',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#EDF2F7',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  input: {
    height: 100,
    textAlignVertical: 'top',
    color: '#2D3748',
  },
  submitButton: {
    backgroundColor: '#4299E1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

