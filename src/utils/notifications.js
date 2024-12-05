import * as Notifications from 'expo-notifications';

export async function schedulePushNotification(title, body, trigger) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger,
  });
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

