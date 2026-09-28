import React, { useEffect, useState } from 'react';

import {
    View,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';

import * as Notifications from 'expo-notifications';

import {
    NavigationContainer,
    createNavigationContainerRef,
} from '@react-navigation/native';

import { doc, updateDoc } from 'firebase/firestore';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';

import { db } from './src/config/firebase';

import AuthScreen from './src/screens/AuthScreen';
import TabNavigator from './src/navigation/TabNavigator';
import SkillHistoryScreen from './src/screens/SkillHistoryScreen';
import AsapTasksScreen from './src/screens/AsapTasksScreen';
import OnlineTasksScreen from './src/screens/OnlineTasksScreen';
import OfflineTasksScreen from './src/screens/OfflineTasksScreen';
import TaskDetailsScreen from './src/screens/TaskDetailsScreen';
import ReviewApplicantsScreen from './src/screens/ReviewApplicantsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

const navigationRef = createNavigationContainerRef<any>();

const AppContent = () => {
    const { session, isOnboarded, loading } = useAuth();

    const [navigationReady, setNavigationReady] = useState(false);

    const lastNotificationResponse =
        Notifications.useLastNotificationResponse();

    useEffect(() => {
        const handleNotificationTap = async () => {
            if (!lastNotificationResponse) {
                return;
            }

            // Ignore anything other than the normal tap action.
            if (
                lastNotificationResponse.actionIdentifier !==
                Notifications.DEFAULT_ACTION_IDENTIFIER
            ) {
                return;
            }

            // Wait until the user is authenticated and onboarding is complete.
            if (!session?.user?.id || !isOnboarded || loading) {
                return;
            }

            // Wait until the main navigation container is ready.
            if (!navigationReady || !navigationRef.isReady()) {
                return;
            }

            const content =
                lastNotificationResponse.notification.request.content;

            const data = (content.data ?? {}) as {
                notificationId?: string;
                reference_id?: string;
            };

            const notificationId = data.notificationId;
            const taskId = data.reference_id;

            // Mark the notification as read when possible.
            if (notificationId) {
                try {
                    await updateDoc(
                        doc(db, 'notifications', notificationId),
                        {
                            is_read: true,
                        }
                    );
                } catch (error) {
                    console.error(
                        'Error marking notification as read:',
                        error
                    );
                }
            }

            // Navigate to the related task.
            if (taskId) {
                navigationRef.navigate('TaskDetails', {
                    taskId,
                });
            } else {
                // If there is no task reference, open Activity.
                navigationRef.navigate('MainTabs', {
                    screen: 'Activity',
                });
            }

            // Clear the handled response so it isn't processed again.
            try {
                await Notifications.clearLastNotificationResponseAsync();
            } catch (error) {
                console.error(
                    'Error clearing notification response:',
                    error
                );
            }
        };

        handleNotificationTap();
    }, [
        lastNotificationResponse,
        session?.user?.id,
        isOnboarded,
        loading,
        navigationReady,
    ]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color="#4F46E5"
                />
            </View>
        );
    }

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={() => {
                setNavigationReady(true);
            }}
        >
            <Stack.Navigator
                id="MainStack"
                screenOptions={{
                    headerShown: false,
                }}
            >
                {!session ? (
                    <Stack.Screen
                        name="Auth"
                        component={AuthScreen}
                    />
                ) : !isOnboarded ? (
                    <Stack.Screen
                        name="Onboarding"
                        component={OnboardingScreen}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={TabNavigator}
                        />

                        <Stack.Screen
                            name="SkillHistory"
                            component={SkillHistoryScreen}
                            options={{
                                headerShown: true,
                                headerTitle: '',
                                headerBackTitle: 'Back',
                                headerTintColor: '#111827',
                                headerStyle: {
                                    backgroundColor: '#F3F4F6',
                                },
                                headerShadowVisible: false,
                            }}
                        />

                        <Stack.Screen
                            name="AsapTasks"
                            component={AsapTasksScreen}
                            options={{
                                headerShown: false,
                            }}
                        />

                        <Stack.Screen
                            name="OnlineTasks"
                            component={OnlineTasksScreen}
                            options={{
                                headerShown: false,
                            }}
                        />

                        <Stack.Screen
                            name="OfflineTasks"
                            component={OfflineTasksScreen}
                            options={{
                                headerShown: false,
                            }}
                        />

                        <Stack.Screen
                            name="TaskDetails"
                            component={TaskDetailsScreen}
                            options={{
                                headerShown: false,
                            }}
                        />

                        <Stack.Screen
                            name="ReviewApplicants"
                            component={ReviewApplicantsScreen}
                            options={{
                                headerShown: false,
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
});