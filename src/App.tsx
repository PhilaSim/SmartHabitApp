import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthForm } from './components/auth/AuthForm';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { AddHabitForm } from './components/habits/AddHabitForm';
import { StatsPage } from './components/stats/StatsPage';
import { HabitCalendar } from './components/calendar/HabitCalendar';
import { BadgeDisplay } from './components/badges/BadgeDisplay';
import { useHabits } from './hooks/useHabits';
import { useBadges } from './hooks/useBadges';

function AppContent() {
  const { user, loading } = useAuth();
  const { createHabit, categories } = useHabits();
  const { badges } = useBadges();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial page

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-600">Loading your habit tracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'add-habit':
        return <AddHabitForm onAddHabit={createHabit} categories={categories} />;
      case 'stats':
        return <StatsPage />;
      case 'calendar':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Habit Calendar</h1>
              <p className="text-lg text-gray-600">Visualize your habit completion patterns</p>
            </div>
            <HabitCalendar />
          </div>
        );
      case 'badges':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Your Badges</h1>
              <p className="text-lg text-gray-600">Celebrate your habit-building achievements</p>
            </div>
            <BadgeDisplay badges={badges} />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;