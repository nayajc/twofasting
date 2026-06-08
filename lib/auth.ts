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

function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

function isIOSPWA() {
  if (typeof window === 'undefined') return false;
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as any).standalone === true);
  return isIOS() && standalone;
}

export async function signInWithGoogle(): Promise<void> {
  // Android: popup → WebView → Google이 disallowed_useragent로 차단
  //          → signInWithRedirect 사용 (Chrome Custom Tabs로 열림)
  // iOS PWA: signInWithRedirect → Safari로 나가서 PWA로 못 돌아옴
  //          → signInWithPopup 사용 (iOS 16.4+ PWA에서 정상 동작)
  // 데스크톱/기타: popup 사용

  if (isAndroid()) {
    // Android: popup은 WebView → Google이 차단 → redirect(Chrome Custom Tabs) 사용
    await signInWithRedirect(auth, provider);
  } else {
    // iOS PWA / iOS Safari / 데스크톱: popup 사용
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        await signInWithRedirect(auth, provider);
      } else {
        throw err;
      }
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
