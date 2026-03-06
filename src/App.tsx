/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './pages/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { motion, AnimatePresence } from 'motion/react';

import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    if (user.role === 'teacher') {
      switch (activeTab) {
        case 'dashboard': return <Dashboard />;
        case 'attendance': return <Attendance />;
        default: return <Dashboard />;
      }
    }
    // Student: only dashboard (QR generation)
    return <Dashboard />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="p-8 pt-0 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Copyright © 2026 • Created by KAPURAPU CHANDRADHAR REDDY
          </p>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

