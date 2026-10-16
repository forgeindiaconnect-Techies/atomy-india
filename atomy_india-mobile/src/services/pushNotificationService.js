import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure foreground notification behavior (alert, sound, badge)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Register device with Firebase / APNs and obtain push token
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return null;
  }

  let token = null;

  try {
    // 1. Setup high-importance notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Atomy India Updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#002C6C',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });
    }

    // 2. Request notification permissions from the user
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PushNotification] User denied or dismissed notification permissions');
      return null;
    }

    // 3. Fetch device push token (FCM token on Android)
    try {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      token = deviceToken.data;
      console.log('[PushNotification] Obtained Native FCM Device Token:', token);
    } catch (deviceTokenErr) {
      console.log('[PushNotification] Direct device token fallback to Expo token:', deviceTokenErr?.message);
      try {
        const expoToken = await Notifications.getExpoPushTokenAsync();
        token = expoToken.data;
        console.log('[PushNotification] Obtained Expo Push Token:', token);
      } catch (expoTokenErr) {
        console.warn('[PushNotification] Could not obtain push token:', expoTokenErr?.message);
      }
    }
  } catch (error) {
    console.warn('[PushNotification] Registration error:', error);
  }

  return token;
}

/**
 * Listen for incoming notifications while app is in foreground and user taps
 */
export function setupNotificationListeners(onReceived, onResponse) {
  if (Platform.OS === 'web') {
    return () => {};
  }

  // Triggered when notification arrives while app is open
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[PushNotification] Foreground notification received:', notification);
    if (onReceived) {
      onReceived(notification);
    }
  });

  // Triggered when user taps on the notification in the top status bar
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[PushNotification] User interacted with notification:', response);
    if (onResponse) {
      onResponse(response);
    }
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
