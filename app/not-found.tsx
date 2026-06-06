import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">🌿</div>
      <h2 className="text-2xl font-black text-gray-800">페이지를 찾을 수 없어요</h2>
      <Link href="/timer" className="btn-primary text-sm px-6 py-3">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
