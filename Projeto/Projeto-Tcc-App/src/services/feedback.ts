import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface FeedbackData {
  appRating: number;
  compatibilityRating: number;
  metExpectations: boolean;
  technicalIssues?: string;
  suggestions?: string;
  userId: string;
  userEmail: string;
  createdAt: Date;
}

export async function submitFeedback(feedback: Omit<FeedbackData, 'userId' | 'userEmail' | 'createdAt'>) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const feedbackWithMetadata = {
      ...feedback,
      userId: user.uid,
      userEmail: user.email || 'Email não fornecido',
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'feedback'), feedbackWithMetadata);
  } catch (error) {
    console.error('Erro ao enviar feedback:', error);
    throw error;
  }
}
