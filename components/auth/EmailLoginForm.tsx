'use client';
import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, resetPassword } from '@/lib/auth';

type Mode = 'signin' | 'signup' | 'reset';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': '등록되지 않은 이메일입니다.',
  'auth/wrong-password': '비밀번호가 틀렸습니다.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
  'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
};

export function EmailLoginForm() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return; }
        await signUpWithEmail(email, password, nickname.trim());
      } else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: any) {
      setError(ERROR_MESSAGES[err?.code] ?? '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="w-full max-w-xs text-center">
        <div className="text-3xl mb-3">📬</div>
        <p className="text-sm font-bold text-gray-800">비밀번호 재설정 메일을 보냈습니다</p>
        <p className="text-xs text-gray-400 mt-1 mb-4">{email}</p>
        <button onClick={() => { setMode('signin'); setResetSent(false); }}
          className="text-sm font-bold text-gray-500 underline">
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
      {mode === 'signup' && (
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-gray-400"
        />
      )}
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-gray-400"
      />
      {mode !== 'reset' && (
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-gray-400"
        />
      )}

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-3 bg-gray-900 text-white font-black text-sm rounded-xl disabled:opacity-40 active:scale-95 transition-all">
        {loading ? '...' : mode === 'signin' ? '이메일로 로그인' : mode === 'signup' ? '회원가입' : '재설정 메일 보내기'}
      </button>

      {/* 하단 링크 */}
      <div className="flex justify-between text-xs text-gray-400 pt-1">
        {mode === 'signin' && (
          <>
            <button type="button" onClick={() => { setMode('signup'); setError(''); }}
              className="underline">회원가입</button>
            <button type="button" onClick={() => { setMode('reset'); setError(''); }}
              className="underline">비밀번호 찾기</button>
          </>
        )}
        {(mode === 'signup' || mode === 'reset') && (
          <button type="button" onClick={() => { setMode('signin'); setError(''); }}
            className="underline mx-auto">로그인으로 돌아가기</button>
        )}
      </div>
    </form>
  );
}
