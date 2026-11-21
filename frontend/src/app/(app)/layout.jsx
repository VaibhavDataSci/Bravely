"use client";
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell, FullScreenMessage } from '@/components/layout/AppShell';
import { navFor, sectionOf } from '@/components/layout/navConfig';
import { NeonButton } from '@/components/shared';
import { useAuth } from '@/contexts/AuthContext';

// Live interview, coding and video rooms run fullscreen without application navigation.
const IMMERSIVE_SECTIONS = ['solo-session', 'mock-room', 'group-room', 'coding'];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, retry } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth');
  }, [status, router]);

  if (status === 'loading') {
    return <FullScreenMessage busy title="Loading your workspace" />;
  }
  if (status === 'unavailable') {
    return (
      <FullScreenMessage
        title="Can't reach the server"
        body="Check your connection. Your session is saved and will resume once the server responds."
        action={<NeonButton onClick={retry}>Try again</NeonButton>}
      />
    );
  }
  if (status !== 'authenticated') return null;

  if (IMMERSIVE_SECTIONS.includes(sectionOf(pathname))) {
    return <div className="bv-immersive" style={{ '--accent': navFor(pathname).accent }}>{children}</div>;
  }
  return <AppShell>{children}</AppShell>;
}
