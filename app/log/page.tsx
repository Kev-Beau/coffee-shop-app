'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to shops page - the log modal will be triggered from there
    router.push('/shops');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
