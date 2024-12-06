import * as Notifications from 'expo-notifications';

export async function schedulePushNotification(title, body, trigger) {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger,
  });
  return identifier;
}

export async function cancelScheduledNotification(identifier) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('No se otorgaron permisos para las notificaciones');
    return false;
  }
  return true;
}

export async function notifyEventChange(eventId, title, changes) {
  const notification = {
    title: `Cambios en el evento: ${title}`,
    body: `Se han realizado los siguientes cambios: ${changes.join(', ')}`,
  };
  await Notifications.scheduleNotificationAsync({
    content: notification,
    trigger: null, // Enviar inmediatamente
  });
}

