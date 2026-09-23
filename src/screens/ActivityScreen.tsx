import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    collection,
    onSnapshot,
    query,
    where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    reference_id?: string | null;
    created_at: string;
    is_read: boolean;
}

export default function ActivityScreen() {
    const { session } = useAuth();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('user_id', '==', session.user.id)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const notificationData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Notification[];

                // Newest notification first
                notificationData.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );

                setNotifications(notificationData);
                setLoading(false);
            },
            (error) => {
                console.error('Notification listener error:', error);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [session?.user?.id]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor(
            (Date.now() - date.getTime()) / 1000
        );

        if (seconds < 60) return 'Just now';

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const renderNotification = ({
        item,
    }: {
        item: Notification;
    }) => (
        <View style={styles.notificationCard}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                    {item.type === 'application' ? '⭐' : '🔔'}
                </Text>
            </View>

            <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                    {item.title}
                </Text>

                <Text style={styles.notificationMessage}>
                    {item.message}
                </Text>

                <Text style={styles.time}>
                    {formatTime(item.created_at)}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Activity</Text>
                <Text style={styles.subtitle}>
                    Your latest notifications
                </Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color="#4F46E5"
                    />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyIcon}>🔔</Text>

                    <Text style={styles.emptyTitle}>
                        No notifications yet
                    </Text>

                    <Text style={styles.emptyText}>
                        Activity from your tasks will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNotification}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },

    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
    },

    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#111827',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    list: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },

    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    iconContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    icon: {
        fontSize: 21,
    },

    notificationContent: {
        flex: 1,
    },

    notificationTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },

    notificationMessage: {
        fontSize: 14,
        lineHeight: 20,
        color: '#4B5563',
    },

    time: {
        marginTop: 7,
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    emptyIcon: {
        fontSize: 42,
        marginBottom: 12,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 6,
    },

    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});