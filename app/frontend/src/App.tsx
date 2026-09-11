import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppNavigation } from './components/AppNavigation';
import { DashboardPage } from './pages/DashboardPage';
import { BundlesPage } from './pages/BundlesPage';
import { BundleDetailPage } from './pages/BundleDetailPage';
import { BundleFormPage } from './pages/BundleFormPage';
import { ActivityPage } from './pages/ActivityPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <AppNavigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/bundles" element={<BundlesPage />} />
            <Route path="/app/bundles/new" element={<BundleFormPage />} />
            <Route path="/app/bundles/:id" element={<BundleDetailPage />} />
            <Route path="/app/bundles/:id/edit" element={<BundleFormPage />} />
            <Route path="/app/activity" element={<ActivityPage />} />
            <Route path="/app/alerts" element={<AlertsPage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
