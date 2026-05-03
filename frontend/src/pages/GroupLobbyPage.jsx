import React from 'react';
import { C } from '../constants/theme';
import { CreateRoomCard } from '../components/group/CreateRoomCard';
import { JoinRoomCard } from '../components/group/JoinRoomCard';
import { RoomList } from '../components/group/RoomList';

export const GroupLobbyPage = () => {
  return (
    <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          border: `1px solid ${C.border}`
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Group Discussion Lobby
          </h1>
          <p style={{ color: C.textDim, fontSize: 14, maxWidth: 640, lineHeight: 1.5 }}>
            Create a private room to practice with friends, or join a public room to network and discuss topics in a real-time, moderated environment.
          </p>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          <CreateRoomCard />
          <JoinRoomCard />
        </div>

        {/* Public Rooms List */}
        <RoomList />
        
      </div>
    </div>
  );
};
