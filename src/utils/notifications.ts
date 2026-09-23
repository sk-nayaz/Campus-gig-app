import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: string,
    referenceId?: string
) => {
    await addDoc(collection(db, 'notifications'), {
        user_id: userId,
        title,
        message,
        type,
        reference_id: referenceId || null,
        created_at: new Date().toISOString(),
        is_read: false
    });
};