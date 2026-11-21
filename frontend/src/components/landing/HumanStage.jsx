"use client";
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// Drop a licensed, realistic human GLB at this path. ARKit blendshapes (jawOpen, eyeBlink*) or
// Ready Player Me style visemes (mouthOpen) are driven automatically when the model has them.
export const MODEL_URL = '/models/interviewer.glb';

const JAW_KEYS = ['jawOpen', 'mouthOpen', 'viseme_aa'];
const BLINK_KEYS = ['eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed'];

function setMorph(meshes, keys, value) {
  for (const mesh of meshes) {
    const dict = mesh.morphTargetDictionary;
    if (!dict) continue;
    for (const key of keys) {
      if (key in dict) mesh.morphTargetInfluences[dict[key]] = value;
    }
  }
}

function Human({ speaking }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef(null);
  const meshes = useRef([]);
  const nextBlink = useRef(2);

  useEffect(() => {
    meshes.current = [];
    scene.traverse((o) => { if (o.isMesh && o.morphTargetDictionary) meshes.current.push(o); });
  }, [scene]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // Look gently toward the pointer, breathe slowly.
    g.rotation.y += (state.pointer.x * 0.35 - g.rotation.y) * Math.min(1, dt * 3);
    g.rotation.x += (-state.pointer.y * 0.15 - g.rotation.x) * Math.min(1, dt * 3);
    g.position.y = Math.sin(t * 1.2) * 0.008;

    const jaw = speaking ? 0.15 + 0.35 * Math.abs(Math.sin(t * 9)) * Math.abs(Math.sin(t * 3.1)) : 0;
    setMorph(meshes.current, JAW_KEYS, jaw);

    if (t > nextBlink.current) {
      const phase = (t - nextBlink.current) / 0.16;
      setMorph(meshes.current, BLINK_KEYS, phase < 1 ? Math.sin(phase * Math.PI) : 0);
      if (phase >= 1) nextBlink.current = t + 2 + Math.random() * 3;
    }
  });

  return <group ref={group}><primitive object={scene} /></group>;
}

// Shown until a licensed model exists, or when WebGL is unavailable.
function Fallback() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }} aria-hidden="true">
      <svg viewBox="0 0 200 240" width="62%" style={{ opacity: 0.9 }}>
        <defs>
          <linearGradient id="hs-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--bv-t2)" stopOpacity="0.5" />
            <stop offset="1" stopColor="var(--bv-t4)" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path d="M20 240 C 20 190, 60 176, 100 176 C 140 176, 180 190, 180 240 Z" fill="url(#hs-skin)" />
        <rect x="86" y="150" width="28" height="34" rx="12" fill="url(#hs-skin)" />
        <ellipse cx="100" cy="96" rx="46" ry="56" fill="url(#hs-skin)" />
      </svg>
    </div>
  );
}

// Set NEXT_PUBLIC_HUMAN_MODEL=true once public/models/interviewer.glb exists.
const HAS_MODEL = process.env.NEXT_PUBLIC_HUMAN_MODEL === 'true';

export default function HumanStage({ speaking = false }) {
  if (!HAS_MODEL) return <Fallback />;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.55, 1.1], fov: 28 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
      aria-label="3D interviewer"
    >
      <hemisphereLight args={['#dfe4ff', '#1a1c28', 0.9]} />
      <directionalLight position={[2, 3, 3]} intensity={2.2} />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.8} color="#3FB7C5" />
      <Suspense fallback={null}>
        <Human speaking={speaking} />
      </Suspense>
    </Canvas>
  );
}
