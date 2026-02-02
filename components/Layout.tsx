
import React, { useState, useEffect } from 'react';
import { User, View } from '../types';
import { 
  LogOut, Home, Users, PenSquare, BarChart2, Settings, Volume2, VolumeX, Clock, Shield
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentView: View;
  onChangeView: (view: View) => void;
  onLogout: () => void;
  children: React.ReactNode;
  soundEnabled: boolean;
  toggleSound: () => void;
}

// Simple Chess Knight Icon SVG to replace FontAwesome
const ChessKnightLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={className}>
    <path d="M127.8 288c12.6 1.8 24.3-3.2 27.6-13.7 2.1-6.6-1.5-16.1-9.9-20.9-10.4-5.9-19-4.8-22.3 5.9-2.9 9.3 0 19.9 4.6 28.7zm283.4-38.6c-4.4-23.8-31.5-29.2-35.8-5.3-2 11.2-12.7 18.2-22.6 15.1-9.8-3.1-15-13.8-11.2-23.7 13.9-35.9 66.7-38.3 84.8 6.5 13.4 33.1-23.4 46.1-3.6 77.2 4 6.3 11 10.3 18.6 10.3 12.3 0 22.3-10 22.3-22.3v-58.4c0-34.9-31.6-61.1-65.7-55.8-19.1 3-36.6 14.8-46.3 31.7l-4.7 8.1c-14.7 25.5-2.2 58.1 24.1 63.1 3.5.7 7.1-1.3 7.8-4.8 1.4-6.8-2.6-13.5-9-15.3-11.4-3.2-16.7-17.6-10.2-27.4l4.7-8.1c4.2-7.3 11.9-12.5 20.3-13.8 14.7-2.3 28.3 9 28.3 24.2v25.2c0 2.2-1.8 4-4 4-2.2 0-4-1.8-4-4v-5.2c0-8.8-7.2-16-16-16-8.8 0-16 7.2-16 16v18.1c0 29.4-20.9 54.3-49.8 59.4l-11.2 2c-35.2 6.2-57.6 44.5-43.1 77.3l2.8 6.4c10.4 23.5 33.5 38.6 59.2 38.6h125.7c22 0 41.5-14.5 48.1-35.7l12.3-39.6c4-12.9-1.3-27.1-12.6-33.8zM256 128c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm-64 224c0-17.7-14.3-32-32-32s-32 14.3-32 32 14.3 32 32 32 32-14.3 32-32z"/>
  </svg>
);

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  currentView, 
  onChangeView, 
  onLogout, 
  children,
  soundEnabled,
  toggleSound
}) => {
  const [sessionTime, setSessionTime] = useState(0);

  // Session Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const navItems: { id: View; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Accueil', icon: <Home size={18} /> },
    { id: 'players', label: 'Joueurs', icon: <Users size={18} /> },
    { id: 'sessions', label: 'Sessions', icon: <PenSquare size={18} /> },
    { id: 'stats', label: 'Statistiques', icon: <BarChart2 size={18} /> },
    { id: 'admin', label: 'Admin', icon: <Shield size={18} />, adminOnly: true },
    { id: 'settings', label: 'Paramètres', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen pb-10 flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 select-none cursor-pointer" onClick={() => onChangeView('dashboard')}>
            <ChessKnightLogo className="w-8 h-8 text-primary" />
            <span>ChessMatch</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Session Timer */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 text-sm font-mono text-gray-600" title="Durée de la session">
              <Clock size={14} className="text-primary" />
              <span>{formatTime(sessionTime)}</span>
            </div>

            {/* Sound Toggle */}
            <button 
              onClick={toggleSound}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              title={soundEnabled ? "Désactiver le son" : "Activer le son"}
            >
              {soundEnabled ? <Volume2 size={18} className="text-gray-600" /> : <VolumeX size={18} className="text-gray-400" />}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user.type === 'admin' ? 'Administrateur' : 'Joueur'}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md text-white ${user.type === 'admin' ? 'bg-amber-500' : 'bg-primary'}`}>
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Navigation */}
        <nav className="bg-white rounded-xl p-2 mb-6 flex flex-wrap shadow-sm border border-gray-200 overflow-hidden">
          {navItems.filter(item => !item.adminOnly || user.type === 'admin').map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm md:text-base
                ${currentView === item.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={onLogout}
            className="flex-1 min-w-[100px] py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm md:text-base text-gray-500 hover:text-danger hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="animate-fade-in">
           {children}
        </main>
      </div>
    </div>
  );
};
