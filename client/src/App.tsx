import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { Navbar } from './components/layout/Navbar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ScenarioLibrary } from './pages/ScenarioLibrary';
import { ScenarioStudio } from './pages/ScenarioStudio';
import { SessionLobby } from './pages/SessionLobby';
import { LiveExerciseRoom } from './pages/LiveExerciseRoom';
import { InstructorConsole } from './pages/InstructorConsole';
import { TraineePerformance } from './pages/TraineePerformance';
import { AARReplay } from './pages/AARReplay';
import { ReportsDownloads } from './pages/ReportsDownloads';
import { UserAdmin } from './pages/UserAdmin';
import { ProfileSettings } from './pages/ProfileSettings';

// Layout wrapper for authenticated pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-situ-950 flex items-center justify-center font-mono text-cyan-400 text-xs">
        INITIALIZING SITU-AWARE TERMINAL...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#1e2633] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/scenarios"
              element={
                <AppLayout>
                  <ScenarioLibrary />
                </AppLayout>
              }
            />
            <Route
              path="/studio"
              element={
                <AppLayout>
                  <ScenarioStudio />
                </AppLayout>
              }
            />
            <Route
              path="/lobby"
              element={
                <AppLayout>
                  <SessionLobby />
                </AppLayout>
              }
            />
            <Route
              path="/live"
              element={
                <AppLayout>
                  <LiveExerciseRoom />
                </AppLayout>
              }
            />
            <Route
              path="/instructor"
              element={
                <AppLayout>
                  <InstructorConsole />
                </AppLayout>
              }
            />
            <Route
              path="/performance"
              element={
                <AppLayout>
                  <TraineePerformance />
                </AppLayout>
              }
            />
            <Route
              path="/aar"
              element={
                <AppLayout>
                  <AARReplay />
                </AppLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <AppLayout>
                  <ReportsDownloads />
                </AppLayout>
              }
            />
            <Route
              path="/admin"
              element={
                <AppLayout>
                  <UserAdmin />
                </AppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AppLayout>
                  <ProfileSettings />
                </AppLayout>
              }
            />

            {/* Default fallback */}
            <Route path="*" element={<Navigate to="/aar" replace />} />
          </Routes>
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
