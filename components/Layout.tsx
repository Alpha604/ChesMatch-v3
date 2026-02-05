
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
            <i className="fa-solid fa-chess-knight text-primary"></i>
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
