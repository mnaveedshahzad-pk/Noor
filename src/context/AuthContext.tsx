import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandling';
import {
  DailyPrayerRecord,
  FastingDay,
  GoodDeedLog,
  QuranSession
} from '../types/islamic';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  syncPrayerToCloud: (rec: DailyPrayerRecord) => Promise<void>;
  syncQuranSessionToCloud: (sess: QuranSession) => Promise<void>;
  syncGoodDeedToCloud: (deed: GoodDeedLog) => Promise<void>;
  syncFastingToCloud: (fast: FastingDay) => Promise<void>;
  syncProfileToCloud: (streak: number, points: number, level: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Initialize user document if not existing
        const userDocRef = doc(db, 'users', currentUser.uid);
        getDoc(userDocRef)
          .then((snapshot) => {
            if (!snapshot.exists()) {
              setDoc(userDocRef, {
                id: currentUser.uid,
                email: currentUser.email || '',
                displayName: currentUser.displayName || 'Muslim Striver',
                photoURL: currentUser.photoURL || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }).catch((err) => {
                handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}`);
              });
            }
          })
          .catch((err) => {
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-Out failed:', error);
      throw error;
    }
  };

  const syncPrayerToCloud = async (rec: DailyPrayerRecord) => {
    if (!user) return;
    const path = `users/${user.uid}/prayers/${rec.date}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'prayers', rec.date), {
        userId: user.uid,
        date: rec.date,
        fajr: rec.prayers.Fajr,
        dhuhr: rec.prayers.Dhuhr,
        asr: rec.prayers.Asr,
        maghrib: rec.prayers.Maghrib,
        isha: rec.prayers.Isha,
        tahajjud: rec.optionalPrayers.tahajjud,
        duha: rec.optionalPrayers.duha,
        witr: rec.optionalPrayers.witr,
        rawatibCount: rec.optionalPrayers.rawatibCount,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const syncQuranSessionToCloud = async (sess: QuranSession) => {
    if (!user) return;
    const path = `users/${user.uid}/quran_sessions/${sess.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'quran_sessions', sess.id), {
        id: sess.id,
        userId: user.uid,
        date: sess.date,
        surahNumber: sess.surahNumber,
        surahName: sess.surahName,
        fromAyah: sess.fromAyah,
        toAyah: sess.toAyah,
        pagesRead: sess.pagesRead,
        durationMinutes: sess.durationMinutes,
        reflectionNotes: sess.reflectionNotes || '',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const syncGoodDeedToCloud = async (deed: GoodDeedLog) => {
    if (!user) return;
    const path = `users/${user.uid}/good_deeds/${deed.id}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'good_deeds', deed.id), {
        id: deed.id,
        userId: user.uid,
        date: deed.date,
        category: deed.category,
        title: deed.title,
        notes: deed.notes || '',
        points: deed.points,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const syncFastingToCloud = async (fast: FastingDay) => {
    if (!user) return;
    const path = `users/${user.uid}/fasting/${fast.date}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'fasting', fast.date), {
        userId: user.uid,
        date: fast.date,
        isFasting: fast.isFasting,
        type: fast.type,
        suhoorCompleted: fast.suhoorCompleted,
        iftarCompleted: fast.iftarCompleted,
        waterGlasses: fast.waterGlasses,
        notes: fast.notes || '',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const syncProfileToCloud = async (streak: number, points: number, level: number) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          currentStreak: streak,
          totalPoints: points,
          currentLevel: level,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOutUser,
        syncPrayerToCloud,
        syncQuranSessionToCloud,
        syncGoodDeedToCloud,
        syncFastingToCloud,
        syncProfileToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
