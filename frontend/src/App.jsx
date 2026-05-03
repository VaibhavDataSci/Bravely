import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { SoloPage } from './pages/SoloPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { MockPage } from './pages/MockPage';
import { CodingPage } from './pages/CodingPage';
import { LobbyPage } from './pages/LobbyPage';
import { P2PPage } from './pages/P2PPage';
import { GroupPage } from './pages/GroupPage';
import { GroupLobbyPage } from './pages/GroupLobbyPage';
import { ReportPage } from './pages/ReportPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { MockModeSelection } from './pages/MockModeSelection';
import ProtectedRoute from './routes/ProtectedRoute';
import { FullscreenLayout } from './layouts/FullscreenLayout';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — no sidebar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          {/* App routes — with sidebar */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/solo-select" element={<RoleSelectionPage />} />
            <Route path="/group-lobby" element={<GroupLobbyPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/mock" element={<MockModeSelection />} />
          </Route>

          {/* Fullscreen app routes */}
          <Route element={<ProtectedRoute><FullscreenLayout /></ProtectedRoute>}>
            <Route path="/solo-session" element={<SoloPage />} />
            <Route path="/solo" element={<Navigate to="/solo-select" replace />} />
            <Route path="/mock-room/:roomId" element={<MockPage />} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/p2p" element={<P2PPage />} />
            <Route path="/group-room/:roomId" element={<GroupPage />} />
            <Route path="/group" element={<Navigate to="/group-lobby" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<PublicLayout />}>
            <Route path="*" element={<LandingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
