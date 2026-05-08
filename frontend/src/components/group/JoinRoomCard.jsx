"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C } from '../../constants/theme';
import { GlassCard, NeonButton, NeonInput } from '../shared';

export const JoinRoomCard = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');

  const handleJoin = () => {
    if (!roomId.trim()) return;
    // Mock validation logic
    console.log('Joining room:', { roomId, password });
    router.push(`/group-room/${roomId}`);
  };

  return (
    <GlassCard style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Join Private Room</h2>
      
      <NeonInput 
        label="Room ID"
        value={roomId} 
        onChange={(e) => setRoomId(e.target.value)} 
        placeholder="Enter 5-10 character ID..."
      />

      <NeonInput 
        label="Password (Optional)"
        type="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Enter password..."
      />

      <NeonButton variant="outline" onClick={handleJoin} style={{ marginTop: 4 }}>Join Room</NeonButton>
    </GlassCard>
  );
};
