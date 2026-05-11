"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { C } from '../../constants/theme';
import { NeonButton } from '../shared';

// Update with real server URL matching server/index.js default port
const SOCKET_SERVER_URL = 'http://localhost:5000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const VideoCard = ({ stream, isLocal, label, isActive }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', 
      background: '#0a0d14', borderRadius: 16, overflow: 'hidden',
      border: `1px solid ${isActive ? C.cyan : C.borderMid}`,
      boxShadow: isActive ? `0 0 24px ${C.cyan}20` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.6)', 
        padding: '4px 12px', borderRadius: 6, fontSize: 12, color: '#fff', 
        border: `1px solid rgba(255,255,255,0.1)`, zIndex: 2
      }}>
        {label}
      </div>
      {stream ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={isLocal}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isLocal ? 'scaleX(-1)' : 'none' }} 
        />
      ) : (
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${C.cyan}, ${C.violetMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff' }}>
          {isLocal ? 'Me' : '?'}
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)', pointerEvents: 'none' }} />
    </div>
  );
};

export const VideoCall = ({ roomId, userId, mode = 'mock', onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [timer, setTimer] = useState('00:00');

  const socketRef = useRef();
  const peersRef = useRef({});
  const userVideoRef = useRef();
  const containerRef = useRef(null);

  const timerRef = useRef()
  const timeVal = useRef(0)

  const createPeer = useCallback((userToSignal, callerID, stream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          target: userToSignal,
          caller: callerID,
          candidate: event.candidate
        });
      }
    };

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.createOffer().then(offer => {
      peer.setLocalDescription(offer);
      socketRef.current.emit('offer', {
        target: userToSignal,
        caller: callerID,
        sdp: offer
      });
    });

    peer.ontrack = (event) => {
      setRemoteStreams(prev => ({
         ...prev,
         [userToSignal]: event.streams[0]
      }));
    };

    return peer;
  }, []);

  const addPeer = useCallback((callerID, stream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
           target: callerID,
           caller: socketRef.current.id,
           candidate: event.candidate
        });
      }
    };

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      setRemoteStreams(prev => ({
         ...prev,
         [callerID]: event.streams[0]
      }));
    };

    return peer;
  }, []);

  useEffect(() => {
    // Timer Logic
    timerRef.current = setInterval(() => {
      timeVal.current += 1
      const m = Math.floor(timeVal.current / 60).toString().padStart(2, '0')
      const s = (timeVal.current % 60).toString().padStart(2, '0')
      setTimer(`${m}:${s}`)
    }, 1000)

    // Init Socket
    socketRef.current = io(SOCKET_SERVER_URL);
    
    // Get Local Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setLocalStream(stream);

      // Join Room Request after grabbing media
      socketRef.current.emit('join-room', { roomId, userId });

      // Event: Existing Users
      socketRef.current.on('existing-users', (users) => {
        users.forEach(userID => {
          const peer = createPeer(userID, socketRef.current.id, stream);
          peersRef.current[userID] = peer;
        });
      });

      // Event: User Joined (We receive offer from them soon)
      socketRef.current.on('user-joined', (payload) => {
        const peer = addPeer(payload.socketId, stream);
        peersRef.current[payload.socketId] = peer;
      });

      // Event: Receiving Offer
      socketRef.current.on('offer', (payload) => {
        const peer = peersRef.current[payload.caller];
        if (peer) {
          peer.setRemoteDescription(new RTCSessionDescription(payload.sdp)).then(() => {
            peer.createAnswer().then(answer => {
              peer.setLocalDescription(answer);
              socketRef.current.emit('answer', {
                target: payload.caller,
                caller: socketRef.current.id,
                sdp: answer
              });
            });
          });
        } else {
           const newPeer = addPeer(payload.caller, stream);
           peersRef.current[payload.caller] = newPeer;
           newPeer.setRemoteDescription(new RTCSessionDescription(payload.sdp)).then(() => {
            newPeer.createAnswer().then(answer => {
              newPeer.setLocalDescription(answer);
              socketRef.current.emit('answer', {
                target: payload.caller,
                caller: socketRef.current.id,
                sdp: answer
              });
            });
          });
        }
      });

      // Event: Receiving Answer
      socketRef.current.on('answer', (payload) => {
        const peer = peersRef.current[payload.caller];
        if (peer) {
          peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
      });

      // Event: Receiving ICE Candidate
      socketRef.current.on('ice-candidate', (payload) => {
         const peer = peersRef.current[payload.caller];
         if (peer && payload.candidate) {
            peer.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(e => console.error(e));
         }
      });

      // Event: User Left
      socketRef.current.on('user-left', (id) => {
        if (peersRef.current[id]) {
          peersRef.current[id].close();
          delete peersRef.current[id];
        }
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      });
    }).catch(err => {
      console.error("No media permission:", err);
      // Error handling can use alert or custom UI
    });

    return () => {
      clearInterval(timerRef.current);
      socketRef.current.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      Object.keys(peersRef.current).forEach(id => {
         peersRef.current[id].close();
      });
    };
   
  }, [addPeer, createPeer, roomId]);


  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
      setMicMuted(!localStream.getAudioTracks()[0].enabled);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
      setCamOff(!localStream.getVideoTracks()[0].enabled);
    }
  };
  
  const remoteEntries = Object.entries(remoteStreams);
  const totalUsers = remoteEntries.length + 1;

  // Grid layout logic
  const isMock = mode === 'mock';
  const gridStyle = isMock ? {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '0 32px', flex: 1, minHeight: 0
  } : {
    display: 'grid', gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(totalUsers))}, 1fr)`, gap: 16, padding: 24, flex: 1, minHeight: 0
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
        {/* Header / Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
          
          {/* Room Info */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '8px 16px', border: `1px solid ${C.border}` }}>
             <span style={{ color: C.text, fontFamily: 'Space Grotesk', fontWeight: 600 }}>Room: {roomId}</span>
             <span style={{ color: C.textMuted, marginLeft: 16, borderLeft: `1px solid ${C.border}`, paddingLeft: 16 }}>Participants: {totalUsers}</span>
          </div>

          {/* Timer Display */}
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700 }}>
            <span style={{ color: C.red, marginRight: 8, animation: 'pulse-ring 2s infinite' }}>●</span>
            {timer}
          </div>
        </div>

        {/* Video Grid */}
        <div style={gridStyle}>
            <VideoCard stream={localStream} isLocal={true} label={isMock ? "Interviewer (You)" : "You"} isActive={!micMuted} />
            {remoteEntries.map(([id, stream], idx) => (
                <VideoCard key={id} stream={stream} isLocal={false} label={isMock ? "Candidate" : `Peer ${idx + 1}`} isActive={false} />
            ))}
            {isMock && remoteEntries.length === 0 && (
                <VideoCard stream={null} isLocal={false} label="Waiting for Candidate..." isActive={false} />
            )}
        </div>

        {/* Bottom Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, padding: '24px 32px', background: 'linear-gradient(to top, rgba(3,7,18,1) 30%, transparent)' }}>
          <button 
            onClick={toggleMic}
            style={{ width: 56, height: 56, borderRadius: '50%', background: micMuted ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${micMuted ? C.red : C.borderMid}`, color: micMuted ? C.red : C.text, fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          >
            {micMuted ? '🔇' : '🎤'}
          </button>
          
          <button 
            onClick={toggleCam}
            style={{ width: 56, height: 56, borderRadius: '50%', background: camOff ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${camOff ? C.red : C.borderMid}`, color: camOff ? C.red : C.text, fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          >
            {camOff ? '🚫' : '📷'}
          </button>

          <NeonButton 
            variant="primary" 
            onClick={onEndCall}
            style={{ background: C.red, color: '#fff', borderColor: C.red, padding: '0 32px', height: 56, borderRadius: 28, fontSize: 16, fontWeight: 700, boxShadow: `0 0 20px rgba(239,68,68,0.3)` }}
          >
            End Call
          </NeonButton>
        </div>
    </div>
  );
};
