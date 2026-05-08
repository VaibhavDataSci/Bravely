"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { C } from '../../constants/theme';
import { GlassCard, NeonButton, NeonInput } from '../shared';

export const CreateRoomCard = () => {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(5);

  const handleCreate = () => {
    if (!roomName.trim()) return;
    const roomId = Math.random().toString(36).substring(2, 9);
    // Mock room creation logic
    const newRoom = { id: roomId, name: roomName, isPrivate, password, maxParticipants };
    console.log('Created room:', newRoom);
    router.push(`/group-room/${roomId}`);
  };

  return (
    <GlassCard style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Create Room</h2>
      
      <NeonInput 
        label="Room Name"
        value={roomName} 
        onChange={(e) => setRoomName(e.target.value)} 
        placeholder="e.g., Senior Frontend Mock"
      />

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 4 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textDim, cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={isPrivate} 
            onChange={(e) => setIsPrivate(e.target.checked)} 
            style={{ width: 14, height: 14, accentColor: C.cyan }}
          />
          Private Room
        </label>
      </div>

      {isPrivate && (
        <NeonInput 
          label="Password"
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter password..."
        />
      )}

      <div>
        <label style={{ fontSize: 13, color: C.textMuted, display: 'block', marginBottom: 6 }}>Max Participants ({maxParticipants})</label>
        <input 
          type="range" 
          min="2" max="10" 
          value={maxParticipants} 
          onChange={(e) => setMaxParticipants(parseInt(e.target.value))} 
          style={{ width: '100%', accentColor: C.violetBright }}
        />
      </div>

      <NeonButton onClick={handleCreate} style={{ marginTop: 4 }}>Create</NeonButton>
    </GlassCard>
  );
};
