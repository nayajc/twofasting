import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ActiveFast, FastingRecord, FastingDuration, WeightRecord } from '@/types';
import { toDateKey, computeStreak } from './fasting';

function toDate(ts: any): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

// ── Active Fast (singleton) ──────────────────────────────────────────────────

export async function startFast(uid: string, goalHours: FastingDuration): Promise<void> {
  const ref = doc(db, 'users', uid, 'state', 'activeFast');
  await setDoc(ref, {
    startTime: serverTimestamp(),
    goalHours,
    status: 'active',
  });
}

export async function updateFastStartTime(uid: string, newStartTime: Date): Promise<void> {
  const ref = doc(db, 'users', uid, 'state', 'activeFast');
  await setDoc(ref, { startTime: Timestamp.fromDate(newStartTime) }, { merge: true });
}

export async function stopFast(
  uid: string,
  activeFast: ActiveFast,
  completed: boolean
): Promise<void> {
  const endTime = new Date();
  const achievedHours =
    (endTime.getTime() - activeFast.startTime.getTime()) / (1000 * 60 * 60);
  const dateKey = toDateKey(endTime);

  const fastRef = doc(db, 'users', uid, 'fasts', `${dateKey}-${Date.now()}`);
  await setDoc(fastRef, {
    startTime: Timestamp.fromDate(activeFast.startTime),
    endTime: Timestamp.fromDate(endTime),
    goalHours: activeFast.goalHours,
    achievedHours: Math.round(achievedHours * 10) / 10,
    completed,
    dateKey,
    status: completed ? 'completed' : 'abandoned',
  });

  const activeRef = doc(db, 'users', uid, 'state', 'activeFast');
  await deleteDoc(activeRef);

  if (completed) {
    await updateStreak(uid);
  }
}

export function subscribeActiveFast(
  uid: string,
  callback: (fast: ActiveFast | null) => void
): () => void {
  const ref = doc(db, 'users', uid, 'state', 'activeFast');
  return onSnapshot(ref, snap => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      startTime: toDate(data.startTime),
      goalHours: data.goalHours as FastingDuration,
      status: 'active',
    });
  });
}

// ── History ──────────────────────────────────────────────────────────────────

export async function getFastHistory(uid: string): Promise<FastingRecord[]> {
  const oneYearAgo = toDateKey(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
  const q = query(
    collection(db, 'users', uid, 'fasts'),
    where('dateKey', '>=', oneYearAgo),
    orderBy('dateKey', 'desc'),
    limit(400)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    startTime: toDate(d.data().startTime),
    endTime: toDate(d.data().endTime),
  })) as FastingRecord[];
}

// ── Weight ────────────────────────────────────────────────────────────────────

export async function saveWeight(uid: string, weight: number, dateKey: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'weights', dateKey);
  await setDoc(ref, {
    weight,
    dateKey,
    recordedAt: serverTimestamp(),
  });
}

export async function getWeightHistory(uid: string): Promise<WeightRecord[]> {
  const q = query(
    collection(db, 'users', uid, 'weights'),
    orderBy('dateKey', 'desc'),
    limit(90)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    recordedAt: toDate(d.data().recordedAt),
  })) as WeightRecord[];
}

export async function deleteWeight(uid: string, dateKey: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'weights', dateKey));
}

export async function updateStreak(uid: string): Promise<void> {
  const records = await getFastHistory(uid);
  const { current, longest } = computeStreak(records);
  await setDoc(
    doc(db, 'users', uid),
    { currentStreak: current, longestStreak: longest },
    { merge: true }
  );
}
