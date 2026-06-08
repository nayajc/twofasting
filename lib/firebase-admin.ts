import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) throw new Error('FIREBASE_SERVICE_ACCOUNT env var not set');

  return initializeApp({
    credential: cert(JSON.parse(serviceAccount)),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
