
import React from 'react';
import { User, Player, Session } from '../types';
import { Trophy, Users, Gamepad2, TrendingUp, Plus, Crown, ClipboardList } from 'lucide-react';

interface DashboardProps {
  user: User;
  players: Player[];
  sessions: Session[];
  onNavigate: (view: any) => void;
  onOpenSessionModal: () => void;
  onOpenPlayerModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, players, sessions, onNavigate, onOpenSessionModal, onOpenPlayerModal 
}) => {
  // Calculate summary stats
  const totalGames = sessions.reduce((acc, s) => acc + s.wins + s.draws + s.losses, 0);
  const totalWins = sessions.reduce((acc, s) => acc + s.wins, 0);
  const totalDraws = sessions.reduce((acc, s) => acc + s.draws, 0);
  const totalLosses = sessions.reduce((acc, s) => acc + s.losses, 0);
  
  // Simple ELO estimation logic
  const currentRating = 1200 + (totalWins * 10) - (totalLosses * 8);

  const StatCard = ({ title, value, icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-transparent hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClass}`}></div>
      <div className="flex items-center gap-4 mb-2">
        <div className={`p-3 rounded-xl bg-gray-50 text-gray-700 group-hover:text-primary transition-colors`}>
          {icon}
        </div>
        <h3 className="font-semibold text-gray-500">{title}</h3>
      </div>
      <div className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${colorClass}`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="border-b pb-4 mb-6 border-gray-200">
        <h2 className="text-2xl font-bold text-dark">Tableau de bord</h2>
        <p className="text-gray-500">Bienvenue, {user.username}. Voici vos performances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Parties jouées" 
          value={totalGames} 
          icon={<Gamepad2 size={24} />} 
          colorClass="from-blue-500 to-indigo-600" 
        />
        <StatCard 
          title="Classement estimé" 
          value={currentRating} 
          icon={<TrendingUp size={24} />} 
          colorClass="from-purple-500 to-pink-600" 
        />
        <StatCard 
            title="Total Joueurs" 
            value={players.length} 
            icon={<Users size={24} />} 
            colorClass="from-amber-400 to-orange-500" 
          />
      </div>

      <div>
        <h3 className="text-xl font-bold text-dark mb-4">Statistiques Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Victoires" 
            value={totalWins} 
            icon={<Trophy size={24} />} 
            colorClass="from-green-500 to-emerald-600" 
          />
          <StatCard 
            title="Nuls" 
            value={totalDraws} 
            icon={<div className="font-bold text-xl">=</div>} 
            colorClass="from-gray-500 to-slate-600" 
          />
          <StatCard 
            title="Défaites" 
            value={totalLosses} 
            icon={<div className="font-bold text-xl">×</div>} 
            colorClass="from-red-500 to-rose-600" 
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-dark mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={onOpenSessionModal}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 group"
          >
            <ClipboardList size={32} className="mb-3 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-700">Nouvelle Session</span>
          </button>
          
          <button 
            onClick={onOpenPlayerModal}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 group"
          >
            <Plus size={32} className="mb-3 text-secondary group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-700">Créer Joueur</span>
          </button>

          {user.type === 'admin' && (
            <button 
              onClick={() => onNavigate('admin')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 group"
            >
              <Crown size={32} className="mb-3 text-warning group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-gray-700">Admin Panel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
