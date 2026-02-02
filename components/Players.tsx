
import React, { useState, useMemo } from 'react';
import { Player, User, Session } from '../types';
import { Plus, Trash2, CheckCircle, Trophy, TrendingUp, X, Activity, Calendar, User as UserIcon, Palette, Brain, FileText, Swords, Target, Shield, Lightbulb } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ConfirmationModal } from './ConfirmationModal';

interface PlayersProps {
  user: User;
  players: Player[];
  sessions: Session[];
  onAddPlayer: (playerData: { name: string, rating: number, avatarColor: string, playStyle: string, description: string }) => void;
  onDeletePlayer: (id: number) => void;
  onToggleCertify: (id: number) => void;
}

const COLORS = [
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'red', class: 'bg-red-500' },
  { name: 'green', class: 'bg-green-500' },
  { name: 'amber', class: 'bg-amber-500' },
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'pink', class: 'bg-pink-500' },
  { name: 'teal', class: 'bg-teal-500' },
  { name: 'gray', class: 'bg-gray-600' },
];

const STYLES = [
  { id: 'Polyvalent', label: 'Polyvalent', icon: <Brain size={14} /> },
  { id: 'Attaquant', label: 'Attaquant', icon: <Swords size={14} /> },
  { id: 'Positionnel', label: 'Positionnel', icon: <Target size={14} /> },
  { id: 'Solide', label: 'Solide', icon: <Shield size={14} /> },
  { id: 'Créatif', label: 'Créatif', icon: <Lightbulb size={14} /> },
];

export const Players: React.FC<PlayersProps> = ({ user, players, sessions, onAddPlayer, onDeletePlayer, onToggleCertify }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // Delete State
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rating: 1200,
    avatarColor: 'blue',
    playStyle: 'Polyvalent',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      rating: 1200,
      avatarColor: 'blue',
      playStyle: 'Polyvalent',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddPlayer(formData);
      resetForm();
      setIsModalOpen(false);
    }
  };

  // Stats calculation for selected player
  const playerStats = useMemo(() => {
    if (!selectedPlayer) return null;

    // Find sessions where this player is the opponent
    const playerSessions = sessions.filter(s => s.opponentId === selectedPlayer.id);

    // Calculate details
    const recentGames = playerSessions.slice(-5).reverse(); // Last 5 games
    const gamesData = playerSessions.map(s => ({
      date: new Date(s.date).toLocaleDateString(),
      result: s.wins > s.losses ? 'Défaite' : s.losses > s.wins ? 'Victoire' : 'Nul', // From User perspective, so invert for player
      score: `${s.opponentScore} - ${s.userScore}`,
      type: s.gameType
    })).reverse();

    return {
      history: gamesData,
      totalSessions: playerSessions.length,
      graphData: [
        { name: 'Victoires', value: selectedPlayer.wins },
        { name: 'Nuls', value: selectedPlayer.draws },
        { name: 'Défaites', value: selectedPlayer.losses },
      ]
    };
  }, [selectedPlayer, sessions]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
        <h2 className="text-2xl font-bold text-dark">Gestion des Joueurs</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          <span>Ajouter un Joueur</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Joueur</th>
                <th className="p-4 font-semibold">Classement</th>
                <th className="p-4 font-semibold">Parties</th>
                <th className="p-4 font-semibold">V / D / N</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-12 text-center text-gray-400">
                     <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gray-50 rounded-full">
                            <UserIcon size={48} />
                        </div>
                     </div>
                     <p className="text-lg font-medium text-gray-600">Aucun joueur enregistré</p>
                     <p className="text-sm mt-1">Commencez par ajouter votre premier adversaire.</p>
                   </td>
                 </tr>
              ) : (
                players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setSelectedPlayer(player)}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm bg-${player.avatarColor || 'blue'}-500`}>
                            {player.name.substring(0, 2).toUpperCase()}
                         </div>
                         <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-800">{player.name}</span>
                                {player.certified && (
                                    <CheckCircle size={14} className="text-white bg-blue-500 rounded-full" />
                                )}
                            </div>
                            {player.playStyle && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                    {player.playStyle}
                                </span>
                            )}
                         </div>
                      </div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono font-bold text-sm border border-blue-100">
                                {player.rating}
                            </div>
                        </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{player.games}</td>
                    <td className="p-4">
                      <div className="flex items-center text-sm font-bold">
                          <span className="text-green-600 w-6 text-center">{player.wins}</span> 
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-red-500 w-6 text-center">{player.losses}</span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-gray-500 w-6 text-center">{player.draws}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.type === 'admin' && (
                          <button 
                            onClick={() => onToggleCertify(player.id)}
                            className={`p-2 rounded-lg transition-colors border ${player.certified ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-gray-400 border-gray-200 hover:border-amber-300 hover:text-amber-500'}`}
                            title={player.certified ? "Décertifier" : "Certifier"}
                          >
                            <Trophy size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => setPlayerToDelete(player)}
                          className="p-2 bg-white border border-gray-200 text-gray-400 rounded-lg hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                          title="Supprimer ce joueur"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!playerToDelete}
        onClose={() => setPlayerToDelete(null)}
        onConfirm={() => {
          if (playerToDelete) {
             onDeletePlayer(playerToDelete.id);
             if (selectedPlayer?.id === playerToDelete.id) setSelectedPlayer(null);
          }
        }}
        title="Supprimer le joueur"
        message={
          <span>
            Êtes-vous sûr de vouloir supprimer <strong>{playerToDelete?.name}</strong> ?<br/>
            Toutes les sessions et statistiques liées à ce joueur seront effacées.
          </span>
        }
      />

      {/* Add Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Nouveau Profil</h3>
                <p className="text-sm text-gray-500">Ajoutez un adversaire à votre carnet.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar">
               <div className="p-6 space-y-6">
                 
                 {/* Avatar Picker */}
                 <div className="flex flex-col items-center mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4 bg-${formData.avatarColor}-500 transition-colors duration-300`}>
                        {formData.name ? formData.name.substring(0, 2).toUpperCase() : <UserIcon size={40} />}
                    </div>
                    <div className="flex gap-2 bg-gray-100 p-2 rounded-xl">
                        {COLORS.map(color => (
                            <button
                                key={color.name}
                                type="button"
                                onClick={() => setFormData({...formData, avatarColor: color.name})}
                                className={`w-6 h-6 rounded-full ${color.class} hover:scale-110 transition-transform ${formData.avatarColor === color.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                                title={color.name}
                            />
                        ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Nom du joueur</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
                            placeholder="Ex: Magnus Carlsen"
                            required
                            autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Classement estimé</label>
                        <div className="relative">
                            <TrendingUp className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                            type="number" 
                            value={formData.rating}
                            onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value) || 0})}
                            className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono"
                            placeholder="1200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Style de jeu</label>
                        <div className="relative">
                            <select
                                value={formData.playStyle}
                                onChange={(e) => setFormData({...formData, playStyle: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                            >
                                {STYLES.map(style => (
                                    <option key={style.id} value={style.id}>{style.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                                <Activity size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Note / Description</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[80px] resize-none"
                                placeholder="Notes sur le style, ouvertures préférées, etc."
                            />
                        </div>
                    </div>
                 </div>

               </div>

               <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl hover:bg-primary-dark shadow-md hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Créer le profil
                </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Player Details Modal */}
      {selectedPlayer && playerStats && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar transform transition-all scale-100 relative">
             
             {/* Header Background */}
             <div className={`h-32 w-full bg-gradient-to-r from-${selectedPlayer.avatarColor || 'blue'}-500 to-${selectedPlayer.avatarColor || 'blue'}-600 relative`}>
                <button 
                  onClick={() => setSelectedPlayer(null)} 
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors backdrop-blur-sm"
                >
                  <X size={20} />
                </button>
             </div>

             <div className="px-8 pb-8">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 gap-4">
                    <div className="p-1.5 bg-white rounded-full shadow-lg">
                        <div className={`w-24 h-24 rounded-full bg-${selectedPlayer.avatarColor || 'blue'}-500 flex items-center justify-center text-3xl font-bold text-white`}>
                            {selectedPlayer.name.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h2 className="text-3xl font-black text-gray-800 leading-tight">{selectedPlayer.name}</h2>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                            {selectedPlayer.playStyle && (
                                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                    {selectedPlayer.playStyle}
                                </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center gap-1">
                                <TrendingUp size={10} /> {selectedPlayer.rating} ELO
                            </span>
                        </div>
                    </div>
                </div>

                {selectedPlayer.description && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 text-sm italic">
                        "{selectedPlayer.description}"
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                      <div className="text-2xl font-black text-green-600">
                         {selectedPlayer.games > 0 ? Math.round((selectedPlayer.wins / selectedPlayer.games) * 100) : 0}%
                      </div>
                      <div className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Victoires</div>
                   </div>
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                      <div className="text-2xl font-black text-blue-600">{selectedPlayer.games}</div>
                      <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Matchs</div>
                   </div>
                   <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                      <div className="text-2xl font-black text-purple-600">
                         {selectedPlayer.wins - selectedPlayer.losses > 0 ? `+${selectedPlayer.wins - selectedPlayer.losses}` : selectedPlayer.wins - selectedPlayer.losses}
                      </div>
                      <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Diff</div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Activity size={16} className="text-primary" /> Performance
                      </h3>
                      <div className="h-40 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={playerStats.graphData}>
                               <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                               <Tooltip 
                                cursor={{fill: 'transparent'}} 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                               />
                               <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                                  {playerStats.graphData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Victoires' ? '#10b981' : entry.name === 'Défaites' ? '#ef4444' : '#9ca3af'} />
                                  ))}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   
                   <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Calendar size={16} className="text-primary" /> Derniers Matchs
                      </h3>
                      {playerStats.history.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-gray-400 text-xs italic">Aucune donnée récente</div>
                      ) : (
                        <div className="space-y-2 overflow-y-auto max-h-40 pr-1 custom-scrollbar">
                           {playerStats.history.map((game, idx) => (
                             <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-2">
                                   <span className={`w-2 h-2 rounded-full ${game.result === 'Victoire' ? 'bg-green-500' : game.result === 'Défaite' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                   <span className="font-bold text-gray-700">{game.result}</span>
                                   <span className="text-gray-400">•</span>
                                   <span className="text-gray-500">{game.type}</span>
                                </div>
                                <div className="font-mono font-bold text-gray-800">
                                   {game.score}
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                   <button 
                    onClick={() => setPlayerToDelete(selectedPlayer)}
                    className="text-red-500 hover:text-red-600 text-sm font-bold hover:underline flex items-center gap-2 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                   >
                     <Trash2 size={16} /> Supprimer le profil
                   </button>
                   <button 
                    onClick={() => setSelectedPlayer(null)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                   >
                     Fermer
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
