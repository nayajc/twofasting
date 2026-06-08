import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: 'accessToken required' }, { status: 400 });
    }

    // 카카오 API로 사용자 정보 조회
    const kakaoRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!kakaoRes.ok) {
      return NextResponse.json({ error: 'Invalid Kakao token' }, { status: 401 });
    }

    const kakaoUser = await kakaoRes.json();
    const uid = `kakao:${kakaoUser.id}`;
    const nickname = kakaoUser.kakao_account?.profile?.nickname ?? '사용자';
    const photoURL = kakaoUser.kakao_account?.profile?.profile_image_url ?? null;
    const email = kakaoUser.kakao_account?.email ?? null;

    // Firebase Admin으로 Custom Token 발급
    const adminAuth = getAdminAuth();

    // 사용자 정보를 Firebase Auth에 upsert
    try {
      await adminAuth.updateUser(uid, { displayName: nickname, photoURL: photoURL ?? undefined, email: email ?? undefined });
    } catch {
      await adminAuth.createUser({ uid, displayName: nickname, photoURL: photoURL ?? undefined, email: email ?? undefined });
    }

    const customToken = await adminAuth.createCustomToken(uid, {
      provider: 'kakao',
      nickname,
    });

    return NextResponse.json({ customToken });
  } catch (err) {
    console.error('[kakao auth]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
