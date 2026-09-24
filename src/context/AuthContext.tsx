import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';
import { auth, db } from '../config/firebase';

export type Profile = {
    id: string;
    role: 'student' | 'parent';
    live_status: boolean;
    full_name?: string;
    age?: number;
    year?: string;
    department?: string;
    skills?: string[];
    onboarded?: boolean;
    avatar_url?: string;
    phone_number?: string;
    email_contact?: string;
};

// Map Firebase User to Session for backward compatibility in the app
export type Session = {
    user: User & { id?: string };
};

type AuthContextType = {
    session: Session | null;
    isOnboarded: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
    setIsOnboarded: (val: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    isOnboarded: false,
    loading: true,
    signOut: async () => { },
    setIsOnboarded: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkUser = async (user: User | null) => {
        if (!user) {
            setSession(null);
            setIsOnboarded(false);
            setLoading(false);
            return;
        }

        // Add id property for backward compatibility with older session.user.id
        const sessionUser = user as User & { id?: string };
        sessionUser.id = user.uid;

        setSession({ user: sessionUser });
        try {
            const pushToken = await registerForPushNotificationsAsync();

            if (pushToken) {
                await setDoc(
                    doc(db, 'profiles', user.uid),
                    {
                        push_token: pushToken,
                    },
                    { merge: true }
                );
            }
        } catch (error) {
            console.error('Error registering push notifications:', error);
        }
        try {
            const docRef = doc(db, 'profiles', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setIsOnboarded(data?.onboarded === true);
            } else {
                setIsOnboarded(false);
            }
        } catch (error) {
            console.error('Error fetching profile status:', error);
            setIsOnboarded(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(true); // Lock the UI during transition
            checkUser(user);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ session, isOnboarded, loading, signOut, setIsOnboarded }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
