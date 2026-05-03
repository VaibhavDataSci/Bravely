import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../../constants/theme';
import { GlassCard, NeonButton, Tag } from '../shared';

const MOCK_ROOMS = [
  { id: 'dev-123', name: 'Software Engineer Prep', participants: 3, max: 5, status: 'live' },
  { id: 'prod-456', name: 'Product Manager Discussion', participants: 8, max: 8, status: 'full' },
  { id: 'lead-789', name: 'Leadership & Behavioral', participants: 1, max: 4, status: 'starting' },
];

const RoomCard = ({ room }) => {
  const [hover, setHover] = useState(false);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const isFull = room.participants >= room.max;

  const handleJoin = () => {
    if (isFull || joining) return;
    setJoining(true);
    setTimeout(() => {
      navigate(`/group-room/${room.id}`);
    }, 800); // simulate loading
  };

  const getStatusColor = () => {
    if (isFull) return C.red;
    if (room.status === 'starting') return C.amber;
    return C.green;
  };

  const getStatusText = () => {
    if (joining) return 'Participants joining...';
    if (isFull) return 'Full';
    if (room.status === 'starting') return 'Starting soon...';
    return 'Live session';
  };

  // Dummy avatar colors
  const avatarColors = [C.cyan, C.violetBright, C.amber, C.green, C.red];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleJoin}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px',
        background: hover && !isFull ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        border: `1px solid ${hover && !isFull ? C.cyan : C.border}`,
        transform: hover && !isFull ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
        boxShadow: hover && !isFull ? `0 8px 32px ${C.cyan}15` : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isFull || joining ? 'default' : 'pointer',
        opacity: isFull ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {joining && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: C.cyan, animation: 'scan-line 0.8s ease-in-out forwards', width: '100%' }} />
      )}
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>{room.name}</div>
          <Tag color={getStatusColor()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ 
                width: 6, height: 6, borderRadius: '50%', background: getStatusColor(), 
                boxShadow: `0 0 10px ${getStatusColor()}`,
                animation: room.status === 'live' ? 'pulse-ring 2s infinite' : 'none'
              }} />
              {getStatusText()}
            </div>
          </Tag>
        </div>
        
        <div style={{ fontSize: 13, color: C.textMuted, display: 'flex', gap: 16, alignItems: 'center' }}>
          <span>ID: <code style={{ color: C.cyan, background: 'rgba(6,182,212,0.1)', padding: '2px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono' }}>{room.id}</code></span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {Array.from({ length: Math.min(room.participants, 4) }).map((_, i) => (
                <div key={i} style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: avatarColors[i % avatarColors.length],
                  border: `2px solid #080B14`,
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: 5 - i
                }} />
              ))}
              {room.participants > 4 && (
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: C.glass, border: `2px solid #080B14`, marginLeft: -8, zIndex: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.textDim
                }}>+{room.participants - 4}</div>
              )}
            </div>
            <span style={{ color: isFull ? C.red : C.textDim, fontWeight: 500 }}>{room.participants}/{room.max} Joined</span>
          </div>
        </div>
      </div>
      
      <NeonButton 
        size="sm" 
        variant={hover && !isFull && !joining ? "primary" : "outline"}
        style={{ pointerEvents: 'none', opacity: joining ? 0.7 : 1 }}
      >
        {joining ? 'Joining...' : isFull ? 'Room Full' : 'Join Room'}
      </NeonButton>
    </div>
  );
};

export const RoomList = () => {
  const navigate = useNavigate();

  return (
    <GlassCard style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>Active Public Rooms</h2>
        <NeonButton size="sm" onClick={() => navigate('/group-room/quick-join')}>
          ⚡ Quick Join
        </NeonButton>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MOCK_ROOMS.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
        {MOCK_ROOMS.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: C.textMuted, fontSize: 14 }}>
            No public rooms available right now.
          </div>
        )}
      </div>
    </GlassCard>
  );
};
