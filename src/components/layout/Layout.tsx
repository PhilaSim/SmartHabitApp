import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { LogOut, BarChart3, Plus, Home, Calendar, Award } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Smart Habit Tracker</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email?.split('@')[0]}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <nav className="bg-white/60 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => window.location.hash = '#dashboard'}
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => window.location.hash = '#add-habit'}
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Habit</span>
            </button>
            <button
              onClick={() => window.location.hash = '#stats'}
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Stats</span>
            </button>
            <button
              onClick={() => window.location.hash = '#calendar'}
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => window.location.hash = '#badges'}
              className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Badges</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}