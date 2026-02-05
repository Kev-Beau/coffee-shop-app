'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuickLogModal from '../components/QuickLogModal';

export default function LogPage() {
  const router = useRouter();
  const [showQuickLog, setShowQuickLog] = useState(true);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-20">
        {/* This page just shows the modal */}
      </div>

      <QuickLogModal
        isOpen={showQuickLog}
        onClose={() => {
          setShowQuickLog(false);
          router.back();
        }}
      />
    </>
  );
}
