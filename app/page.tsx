'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '@/components/context/ThemeContext';
import { BootScreen } from '@/components/BootScreen';
import { Desktop } from '@/components/Desktop';

export default function Page() {
  const [booting, setBooting] = useState(true);
  const [bootNonce, setBootNonce] = useState(0);

  const handleTriggerBoot = () => {
    setBooting(true);
    setBootNonce((n) => n + 1);
  };

  return (
    <ThemeProvider>
      <main className="w-full h-[100dvh] overflow-hidden bg-black select-none font-sans">
        {booting ? (
          <BootScreen
            key={bootNonce}
            onBootComplete={() => setBooting(false)}
          />
        ) : (
          <Desktop onTriggerBoot={handleTriggerBoot} />
        )}
      </main>
    </ThemeProvider>
  );
}
