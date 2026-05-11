import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, Timestamp, terminate } from 'firebase/firestore';
import { db } from '../config/firebase';

const bypassAuth =
  import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH !== 'false';
let forceLocalMode = false;
const FIRESTORE_DISABLED_KEY = 'fitness_app__firestore_disabled';

const LS_KEYS = {
  userProfile: 'fitness_app__mock_user_profile',
  workoutLogs: 'fitness_app__mock_workout_logs',
  dietLogs: 'fitness_app__mock_diet_logs',
  progress: 'fitness_app__mock_progress',
} as const;

function notifyLocalChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('fitness_app:logs_updated'));
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function requireDb() {
  if (!db) {
    throw new Error(
      'Firestore is not initialized. Verify Firebase config values and that Firestore is enabled in your Firebase project.'
    );
  }
  return db;
}

function isFirestoreUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("database '(default)' not found") ||
    message.includes('client is offline') ||
    message.includes('failed to get document') ||
    message.includes('firestore is not initialized')
  );
}

function shouldUseLocalMode() {
  const persistedDisable =
    typeof window !== 'undefined' &&
    window.localStorage.getItem(FIRESTORE_DISABLED_KEY) === 'true';
  return bypassAuth || forceLocalMode || persistedDisable;
}

function enableLocalFallback(error: unknown) {
  if (!forceLocalMode) {
    console.warn(
      '[firestore] Firestore unavailable for this session. Switching to local-only mode.',
      error
    );
    if (db) {
      void terminate(db).catch(() => {
        // Ignore termination issues; local fallback remains enabled either way.
      });
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FIRESTORE_DISABLED_KEY, 'true');
    }
    forceLocalMode = true;
  }
}

export interface UserProfile {
  uid: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  activityLevel: string;
  fitnessGoal: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutLog {
  userId: string;
  date: Date;
  workouts: string[];
  completed: boolean;
  notes?: string;
}

export interface DietLog {
  userId: string;
  date: Date;
  meals: Array<{ name: string; calories: number }>;
  totalCalories: number;
  notes?: string;
}

export interface ProgressEntry {
  userId: string;
  date: Date;
  weight: number;
  notes?: string;
}

export interface WorkoutLogRecord extends WorkoutLog {
  id?: string;
}

export interface DietLogRecord extends DietLog {
  id?: string;
}

export interface ProgressLogRecord extends ProgressEntry {
  id?: string;
}

export const createUserProfile = async (profile: UserProfile) => {
  const writeToLocal = () => {
    const toStore = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
    localStorage.setItem(LS_KEYS.userProfile, JSON.stringify(toStore));
    notifyLocalChange();
  };

  if (shouldUseLocalMode()) {
    writeToLocal();
    return;
  }

  try {
    const userRef = doc(requireDb(), 'users', profile.uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    writeToLocal();
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const readLocalProfile = (): UserProfile | null => {
    const stored = safeJsonParse<{
      uid: string;
      email: string;
      age: number;
      height: number;
      weight: number;
      gender: 'male' | 'female';
      activityLevel: string;
      fitnessGoal: string;
      createdAt: string;
      updatedAt: string;
    } | null>(localStorage.getItem(LS_KEYS.userProfile), null);

    if (!stored || stored.uid !== uid) return null;
    return {
      ...stored,
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(stored.updatedAt),
    };
  };

  if (shouldUseLocalMode()) {
    return readLocalProfile();
  }

  try {
    const userRef = doc(requireDb(), 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as UserProfile;
    }
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    return readLocalProfile();
  }
  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (shouldUseLocalMode()) {
    const existing = await getUserProfile(uid);
    if (!existing) return;
    const merged: UserProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    await createUserProfile(merged);
    return;
  }

  try {
    const userRef = doc(requireDb(), 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    await updateUserProfile(uid, updates);
  }
};

export const logWorkout = async (log: WorkoutLog) => {
  if (shouldUseLocalMode()) {
    const logs = safeJsonParse<Array<Record<string, unknown>>>(localStorage.getItem(LS_KEYS.workoutLogs), []);
    logs.push({
      id: crypto.randomUUID(),
      ...log,
      date: log.date.toISOString(),
    });
    localStorage.setItem(LS_KEYS.workoutLogs, JSON.stringify(logs));
    notifyLocalChange();
    return;
  }
  try {
    const logsRef = collection(requireDb(), 'workoutLogs');
    await addDoc(logsRef, {
      ...log,
      date: Timestamp.fromDate(log.date)
    });
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    await logWorkout(log);
  }
};

export const logDiet = async (log: DietLog) => {
  if (shouldUseLocalMode()) {
    const logs = safeJsonParse<Array<Record<string, unknown>>>(localStorage.getItem(LS_KEYS.dietLogs), []);
    logs.push({
      id: crypto.randomUUID(),
      ...log,
      date: log.date.toISOString(),
    });
    localStorage.setItem(LS_KEYS.dietLogs, JSON.stringify(logs));
    notifyLocalChange();
    return;
  }
  try {
    const logsRef = collection(requireDb(), 'dietLogs');
    await addDoc(logsRef, {
      ...log,
      date: Timestamp.fromDate(log.date)
    });
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    await logDiet(log);
  }
};

export const logProgress = async (entry: ProgressEntry) => {
  if (shouldUseLocalMode()) {
    const logs = safeJsonParse<Array<Record<string, unknown>>>(localStorage.getItem(LS_KEYS.progress), []);
    logs.push({
      id: crypto.randomUUID(),
      ...entry,
      date: entry.date.toISOString(),
    });
    localStorage.setItem(LS_KEYS.progress, JSON.stringify(logs));
    notifyLocalChange();
    return;
  }
  try {
    const progressRef = collection(requireDb(), 'progress');
    await addDoc(progressRef, {
      ...entry,
      date: Timestamp.fromDate(entry.date)
    });
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    await logProgress(entry);
  }
};

export const getWorkoutLogs = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WorkoutLogRecord[]> => {
  if (shouldUseLocalMode()) {
    const logs = safeJsonParse<WorkoutLogRecord[]>(
      localStorage.getItem(LS_KEYS.workoutLogs),
      []
    );
    const start = startDate.getTime();
    const end = endDate.getTime();
    return logs
      .filter((l) => l.userId === userId)
      .map((l) => ({
        ...l,
        date: new Date(String(l.date)),
        workouts: Array.isArray(l.workouts)
          ? l.workouts.map((workout) => String(workout))
          : [],
        completed: typeof l.completed === 'boolean' ? l.completed : true,
      }))
      .filter((l) => l.date.getTime() >= start && l.date.getTime() <= end)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  try {
    const logsRef = collection(requireDb(), 'workoutLogs');
    const q = query(
      logsRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate()
    })) as WorkoutLogRecord[];
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    return getWorkoutLogs(userId, startDate, endDate);
  }
};

export const getDietLogs = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DietLogRecord[]> => {
  if (shouldUseLocalMode()) {
    const logs = safeJsonParse<DietLogRecord[]>(
      localStorage.getItem(LS_KEYS.dietLogs),
      []
    );
    const start = startDate.getTime();
    const end = endDate.getTime();
    return logs
      .filter((l) => l.userId === userId)
      .map((l) => ({
        ...l,
        date: new Date(String(l.date)),
        totalCalories:
          typeof l.totalCalories === 'number'
            ? l.totalCalories
            : Number(String(l.totalCalories || 0)) || 0,
      }))
      .filter((l) => l.date.getTime() >= start && l.date.getTime() <= end)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  try {
    const logsRef = collection(requireDb(), 'dietLogs');
    const q = query(
      logsRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate()
    })) as DietLogRecord[];
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    return getDietLogs(userId, startDate, endDate);
  }
};

export const getProgressLogs = async (
  userId: string,
  limit: number = 30
): Promise<ProgressLogRecord[]> => {
  if (shouldUseLocalMode()) {
    const logs = safeJsonParse<ProgressLogRecord[]>(
      localStorage.getItem(LS_KEYS.progress),
      []
    );
    return logs
      .filter((l) => l.userId === userId)
      .map((l) => ({ ...l, date: new Date(String(l.date)) }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  try {
    const progressRef = collection(requireDb(), 'progress');
    const q = query(
      progressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate()
    })) as ProgressLogRecord[];
  } catch (error) {
    if (!isFirestoreUnavailableError(error)) throw error;
    enableLocalFallback(error);
    return getProgressLogs(userId, limit);
  }
};
