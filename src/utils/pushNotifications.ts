import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync() {
    // Push notifications don't work through the web version
    if (Platform.OS === 'web') {
        return null;
    }

    // Push notifications require a physical device
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device.');
        return null;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    // Check existing permission
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // Ask the user if permission hasn't been granted
    if (existingStatus !== 'granted') {
        const { status } =
            await Notifications.requestPermissionsAsync();

        finalStatus = status;
    }

    // User denied permission
    if (finalStatus !== 'granted') {
        console.log('Notification permission was not granted.');
        return null;
    }

    // Get the EAS project ID
    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId) {
        throw new Error('EAS projectId not found.');
    }

    // Get Expo Push Token
    const token =
        await Notifications.getExpoPushTokenAsync({
            projectId,
        });

    console.log('Expo Push Token:', token.data);

    return token.data;
}