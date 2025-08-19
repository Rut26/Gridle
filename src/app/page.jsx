// src/app/page.jsx
"use client";

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (pathname === '/') {
      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/signin');
      }
    }
  }, [session, status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
      <p>Redirecting...</p>
    </div>
  );
}