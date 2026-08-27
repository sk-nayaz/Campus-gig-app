import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Zap } from 'lucide-react-native';
import TaskCard from '../components/TaskCard';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function AsapTasksScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

        const q = query(
            collection(db, 'tasks'),
            where('status', '==', 'open'),
            where('deadline', '>=', startOfDay),
            where('deadline', '<=', endOfDay)
        );

        // Client-side profile cache to avoid redundant reads
        const profilesCache: Record<string, any> = {};

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const tasksPromises = querySnapshot.docs.map(async (docSnap) => {
                const task = { id: docSnap.id, ...docSnap.data() } as any;

                if (task.creator_id) {
                    if (!profilesCache[task.creator_id]) {
                        const profileSnap = await getDoc(doc(db, 'profiles', task.creator_id));
                        if (profileSnap.exists()) {
                            profilesCache[task.creator_id] = profileSnap.data();
                        }
                    }
                    task.profiles = profilesCache[task.creator_id] || {};
                }
                return task;
            });

            const resolvedTasks = await Promise.all(tasksPromises);

            // Filter out own tasks and sort client-side
            const filteredTasks = resolvedTasks
                .filter(t => !session?.user?.id || t.creator_id !== session.user.id)
                .sort((a, b) => {
                    const aDeadline = new Date(a.deadline).getTime();
                    const bDeadline = new Date(b.deadline).getTime();
                    return aDeadline - bDeadline;
                });

            setTasks(filteredTasks);
            setIsLoading(false);
        }, (error) => {
            console.error('Realtime tasks error:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [session?.user?.id]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#ECFDF5', '#F3F4F6', '#EEF2FF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={28} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleRow}>
                        <Zap size={24} color="#10B981" fill="#10B981" style={{ marginRight: 8 }} />
                        <Text style={styles.headerTitle}>Available Now</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>Live feed of the newest campus requests.</Text>
                </View>

                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#10B981" />
                    </View>
                ) : tasks.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No ASAP tasks available right now.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={tasks}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <TaskCard task={item} showActionButton={true} />}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        marginBottom: 16,
        width: 40,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
});
