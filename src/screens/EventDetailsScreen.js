import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, TextInput } from 'react-native';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, deleteDoc, query, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { schedulePushNotification, cancelScheduledNotification } from '../utils/notifications';

export default function EventDetailsScreen({ route, navigation }) {
  const [event, setEvent] = useState(null);
  const [userRSVP, setUserRSVP] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [comments, setComments] = useState([]);
  const { eventId } = route.params;
  const userId = auth.currentUser.uid;

  useEffect(() => {
    fetchEvent();
    fetchComments();
  }, []);

  const fetchEvent = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        setEvent(eventData);
        setEditedEvent(eventData);
        setUserRSVP(eventData.attendees && (eventData.attendees.includes(userId) || eventData.createdBy === userId));
      } else {
        Alert.alert('Error', 'Evento no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'No se pudo cargar el evento');
    }
  };

  const fetchComments = async () => {
    try {
      const commentsQuery = query(collection(db, 'events', eventId, 'comments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(commentsQuery);
      const fetchedComments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleRSVP = async () => {
    try {
      const eventRef = doc(db, 'events', eventId);
      if (!userRSVP) {
        await updateDoc(eventRef, {
          attendees: arrayUnion(userId)
        });
        // Programar notificación
        const notificationId = await schedulePushNotification(
          'Recordatorio de evento',
          `No olvides que mañana asistirás a ${event.title}`,
          new Date(event.date) - 24 * 60 * 60 * 1000
        );
        // Guardar el ID de la notificación en el documento del usuario
        await updateDoc(doc(db, 'users', userId), {
          notifications: arrayUnion({ eventId, notificationId })
        });
      } else {
        await updateDoc(eventRef, {
          attendees: arrayRemove(userId)
        });
        // Cancelar notificación
        const userDoc = await getDoc(doc(db, 'users', userId));
        const notifications = userDoc.data().notifications || [];
        const notification = notifications.find(n => n.eventId === eventId);
        if (notification) {
          await cancelScheduledNotification(notification.notificationId);
          await updateDoc(doc(db, 'users', userId), {
            notifications: arrayRemove(notification)
          });
        }
      }
      setUserRSVP(!userRSVP);
      Alert.alert('Éxito', userRSVP ? 'Has cancelado tu asistencia' : 'Has confirmado tu asistencia');
      fetchEvent();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      Alert.alert('Error', 'No se pudo actualizar tu RSVP');
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `¡Ven conmigo al evento "${event.title}"! Fecha: ${new Date(event.date).toLocaleDateString()}, Lugar: ${event.location}`,
        url: `https://tueventosapp.com/events/${eventId}`,
      });
      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el evento');
    }
  };

  const handleComment = async () => {
    if (comment.trim() === '' || rating === 0) {
      Alert.alert('Error', 'Por favor, escribe un comentario y selecciona una calificación');
      return;
    }

    try {
      const newComment = {
        userId,
        text: comment.trim(),
        rating,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'events', eventId, 'comments'), newComment);
      setComment('');
      setRating(0);
      Alert.alert('Éxito', 'Comentario añadido correctamente');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'No se pudo añadir el comentario');
    }
  };

  const handleEditEvent = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, editedEvent);
      setEvent(editedEvent);
      setIsEditing(false);
      Alert.alert('Éxito', 'Evento actualizado correctamente');
      
      // Notificar a los asistentes sobre el cambio
      event.attendees.forEach(async (attendeeId) => {
        if (attendeeId !== userId) {
          await schedulePushNotification(
            'Cambio en el evento',
            `El evento "${event.title}" ha sido actualizado. Revisa los nuevos detalles.`,
            new Date()
          );
        }
      });
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'No se pudo actualizar el evento');
    }
  };

  const handleDeleteEvent = async () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
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
        }
      ]
    );
  };

  const handleFinishEvent = async () => {
    Alert.alert(
      'Finalizar evento',
      '¿Estás seguro de que quieres finalizar este evento? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Finalizar',
          onPress: async () => {
            try {
              const eventRef = doc(db, 'events', eventId);
              await updateDoc(eventRef, { 
                status: 'finished',
                finishedAt: new Date().toISOString() 
              });
              
              // Actualizar el estado local
              setEvent(prevEvent => ({
                ...prevEvent,
                status: 'finished',
                finishedAt: new Date().toISOString()
              }));
              
              Alert.alert('Éxito', 'Evento finalizado correctamente');
              
              // Forzar una actualización en las pantallas de historial y estadísticas
              navigation.navigate('EventHistory', { refresh: true });
              navigation.navigate('UserStats', { refresh: true });
            } catch (error) {
              console.error('Error finishing event:', error);
              Alert.alert('Error', 'No se pudo finalizar el evento');
            }
          }
        }
      ]
    );
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || editedEvent.date;
    setShowDatePicker(false);
    setEditedEvent({...editedEvent, date: currentDate.toISOString()});
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
      {isEditing ? (
        <View>
          <TextInput
            style={styles.input}
            value={editedEvent.title}
            onChangeText={(text) => setEditedEvent({...editedEvent, title: text})}
            placeholder="Título del evento"
          />
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Text>{new Date(editedEvent.date).toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(editedEvent.date)}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
          <TextInput
            style={styles.input}
            value={editedEvent.location}
            onChangeText={(text) => setEditedEvent({...editedEvent, location: text})}
            placeholder="Ubicación"
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={editedEvent.description}
            onChangeText={(text) => setEditedEvent({...editedEvent, description: text})}
            placeholder="Descripción"
            multiline
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
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
          
          {event.createdBy === userId ? (
            <View>
              <TouchableOpacity style={styles.editButton} onPress={handleEditEvent}>
                <Text style={styles.buttonText}>Editar Evento</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
                <Text style={styles.buttonText}>Eliminar Evento</Text>
              </TouchableOpacity>
              {event.status !== 'finished' && (
                <TouchableOpacity style={styles.finishButton} onPress={handleFinishEvent}>
                  <Text style={styles.buttonText}>Finalizar Evento</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.rsvpButton} onPress={handleRSVP}>
              <Text style={styles.buttonText}>
                {userRSVP ? 'Cancelar Asistencia' : 'Confirmar Asistencia'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Compartir Evento</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.attendeesSection}>
        <Text style={styles.sectionTitle}>Asistentes</Text>
        {event.attendees && event.attendees.length > 0 ? (
          event.attendees.map((attendeeId, index) => (
            <Text key={index} style={styles.attendeeName}>{attendeeId}</Text>
          ))
        ) : (
          <Text style={styles.emptyText}>Aún no hay asistentes confirmados.</Text>
        )}
      </View>

      {userRSVP && !isEditing && event.status !== 'finished' && (
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Deja un comentario</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Escribe tu comentario aquí"
            value={comment}
            onChangeText={setComment}
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
          <TouchableOpacity style={styles.submitButton} onPress={handleComment}>
            <Text style={styles.buttonText}>Enviar Comentario</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.commentList}>
        <Text style={styles.sectionTitle}>Comentarios</Text>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Text style={styles.commentText}>{comment.text}</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= comment.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aún no hay comentarios para este evento.</Text>
        )}
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
  input: {
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#48BB78',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#F56565',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4299E1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  rsvpButton: {
    backgroundColor: '#4299E1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButton: {
    backgroundColor: '#48BB78',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  shareButton: {
    backgroundColor: '#9F7ED3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  attendeesSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2D3748',
  },
  attendeeName: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 5,
  },
  commentSection: {
    marginTop: 30,
  },
  commentInput: {
    backgroundColor: '#EDF2F7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4299E1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  commentList: {
    marginTop: 30,
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
    marginBottom: 5,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#A0AEC0',
  },
});

