import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const provider = new GoogleAuthProvider();

function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as any).standalone === true)
  );
}

export async function signInWithGoogle(): Promise<void> {
  // iOS PWA: signInWithRedirect가 Safari로 나가버려서 돌아올 수 없음
  // → popup 방식 사용 (iOS 16.4+ PWA에서 정상 동작)
  // 구형 iOS fallback: 새 탭에서 열리지만 로그인 후 돌아올 수 있음
  try {
    await signInWithPopup(auth, provider);
  } catch (err: any) {
    const code = err?.code ?? '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      // popup이 차단된 경우에만 redirect로 fallback
      // (iOS PWA에선 이 경우도 Safari로 나감 — 어쩔 수 없는 iOS 제한)
      await signInWithRedirect(auth, provider);
    } else {
      throw err;
    }
  }
}

export async function handleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await upsertUserDoc(result.user);
      return result.user;
    }
    return null;
  } catch {
    return null;
  }
}

export async function signOutUser(unsubscribers: (() => void)[] = []): Promise<void> {
  unsubscribers.forEach(fn => fn());
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function upsertUserDoc(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  await setDoc(
    ref,
    {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
