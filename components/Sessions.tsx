
import React, { useState, useEffect } from 'react';
import { Player, Session, Match, MatchResult } from '../types';
import { Plus, Trash2, Eye, X, Trophy, MinusCircle, Target, Activity, Calendar, Clock, Swords } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface SessionsProps {
  players: Player[];
  sessions: Session[];
  onAddSession: (session: Omit<Session, 'id'>) => void;
  onDeleteSession: (id: number) => void;
  isOpenModal: boolean;
  setIsOpenModal: (isOpen: boolean) => void;
}

export const Sessions: React.FC<SessionsProps> = ({ 
  players, sessions, onAddSession, onDeleteSession, isOpenModal, setIsOpenModal 
}) => {
  // Form State
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [gameType, setGameType] = useState<string>('chess');
  const [timeControl, setTimeControl] = useState<string>('10min');
  const [matches, setMatches] = useState<Match[]>([]);

  // View Details State
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  
  // Delete State
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const resetForm = () => {
    setSelectedOpponent('');
    setGameType('chess');
    setTimeControl('10min');
    setMatches([]);
  };

  const handleAddMatch = () => {
    if (matches.length >= 20) return;
    setMatches([...matches, { number: matches.length + 1, result: 'none', accuracy: undefined, estimatedRating: undefined }]);
  };

  const updateMatch = (index: number, field: keyof Match, value: any) => {
    const newMatches = [...matches];
    newMatches[index] = { ...newMatches[index], [field]: value };
    setMatches(newMatches);
  };

  const removeMatch = (index: number) => {
    const newMatches = matches.filter((_, i) => i !== index).map((m, i) => ({ ...m, number: i + 1 }));
    setMatches(newMatches);
  };

  const calculateScore = () => {
    let userScore = 0;
    let opponentScore = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;

    matches.forEach(m => {
      if (m.result === 'win') { userScore += 1; wins++; }
      else if (m.result === 'draw') { userScore += 0.5; opponentScore += 0.5; draws++; }
      else if (m.result === 'loss') { opponentScore += 1; losses++; }
    });

    return { userScore, opponentScore, wins, draws, losses };
  };

  const handleSaveSession = () => {
    if (!selectedOpponent) return;
    const opponent = players.find(p => p.id === parseInt(selectedOpponent));
    if (!opponent) return;

    const { userScore, opponentScore, wins, draws, losses } = calculateScore();

    const validMatches = matches.filter(m => m.result !== 'none');
    
    if (validMatches.length === 0) {
      alert("Veuillez ajouter au moins une partie jouée.");
      return;
    }

    onAddSession({
      userId: 0, // Filled by App
      opponentId: opponent.id,
      opponentName: opponent.name,
      gameType: gameType as any,
      timeControl,
      userScore,
      opponentScore,
      wins,
      draws,
      losses,
      date: new Date().toISOString(),
      matches: validMatches
    });

    setIsOpenModal(false);
    resetForm();
  };

  const { userScore: liveUserScore, opponentScore: liveOpponentScore } = calculateScore();
  const currentOpponentName = players.find(p => p.id.toString() === selectedOpponent)?.name || 'Adversaire';

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
        <div>
           <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
             <Swords className="text-primary" />
             Sessions de Jeu
           </h2>
           <p className="text-gray-500 text-sm mt-1">Gérez vos affrontements et suivez vos scores.</p>
        </div>
        <button 
          onClick={() => setIsOpenModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
        >
          <Plus size={20} />
          <span>Nouvelle Session</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 dashed-border">
             <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full text-gray-300 mb-4">
               <Trophy size={40} />
             </div>
             <h3 className="text-lg font-bold text-gray-700">Aucune session enregistrée</h3>
             <p className="text-gray-500 mt-2 max-w-sm mx-auto">Commencez par ajouter une session pour suivre votre progression contre vos rivaux.</p>
          </div>
        ) : (
          [...sessions].reverse().map(session => (
            <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-0 overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                {/* Left: Status Strip */}
                <div className={`w-full md:w-2 h-2 md:h-auto ${
                  session.userScore > session.opponentScore ? 'bg-green-500' : 
                  session.userScore < session.opponentScore ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>

                {/* Main Content */}
                <div className="flex-1 p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
                  
                  {/* Info */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500 flex-shrink-0">
                      {session.opponentName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 leading-tight">{session.opponentName}</h3>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1.5 font-medium">
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                          <Calendar size={12} /> {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase tracking-wider">
                           <Clock size={12} /> {session.gameType} • {session.timeControl}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Stats */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                     <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Score</div>
                        <div className={`text-3xl font-black font-mono tracking-tighter ${
                          session.userScore > session.opponentScore ? 'text-green-600' : 
                          session.userScore < session.opponentScore ? 'text-red-500' : 'text-gray-700'
                        }`}>
                          {session.userScore} - {session.opponentScore}
                        </div>
                     </div>
                     
                     <div className="hidden sm:flex gap-1">
                        <div className="flex flex-col items-center w-10">
                          <span className="text-xs font-bold text-green-600">V</span>
                          <span className="font-bold text-gray-700">{session.wins}</span>
                        </div>
                        <div className="w-px bg-gray-200 h-8"></div>
                        <div className="flex flex-col items-center w-10">
                          <span className="text-xs font-bold text-gray-500">N</span>
                          <span className="font-bold text-gray-700">{session.draws}</span>
                        </div>
                        <div className="w-px bg-gray-200 h-8"></div>
                        <div className="flex flex-col items-center w-10">
                          <span className="text-xs font-bold text-red-500">D</span>
                          <span className="font-bold text-gray-700">{session.losses}</span>
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                       <button 
                        onClick={() => setSelectedSession(session)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Détails"
                       >
                         <Eye size={20} />
                       </button>
                       <button 
                        onClick={() => setSessionToDelete(session)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                       >
                         <Trash2 size={20} />
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) {
             onDeleteSession(sessionToDelete.id);
             setSelectedSession(null); // In case it was deleted from detailed view
          }
        }}
        title="Supprimer la session"
        message={
          <span>
            Voulez-vous vraiment supprimer la session contre <strong>{sessionToDelete?.opponentName}</strong> ?<br/>
            Score: {sessionToDelete?.userScore} - {sessionToDelete?.opponentScore}
          </span>
        }
      />

      {/* NEW SESSION MODAL */}
      {isOpenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                 <h3 className="text-xl font-black text-gray-800">Rapport de Session</h3>
                 <p className="text-sm text-gray-500">Entrez les résultats de vos parties</p>
              </div>
              <button onClick={() => { setIsOpenModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50">
              
              {/* Configuration Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Adversaire</label>
                  <div className="relative">
                    <select 
                      value={selectedOpponent}
                      onChange={(e) => setSelectedOpponent(e.target.value)}
                      className="w-full pl-4 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-medium shadow-sm"
                    >
                      <option value="">Sélectionner...</option>
                      {players.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                      <Plus size={16} className="rotate-45" />
                    </div>
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type de jeu</label>
                   <div className="relative">
                     <select 
                      value={gameType} onChange={e => setGameType(e.target.value)}
                      className="w-full pl-4 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-medium shadow-sm"
                     >
                       <option value="chess">Échecs</option>
                       <option value="rapid">Rapide</option>
                       <option value="blitz">Blitz</option>
                     </select>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cadence</label>
                   <div className="relative">
                     <select 
                      value={timeControl} onChange={e => setTimeControl(e.target.value)}
                      className="w-full pl-4 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-medium shadow-sm"
                     >
                       <optgroup label="Bullet">
                         <option value="1+0">1+0</option>
                         <option value="2+1">2+1</option>
                       </optgroup>
                       <optgroup label="Blitz">
                         <option value="3+0">3+0</option>
                         <option value="3+2">3+2</option>
                         <option value="5+0">5+0</option>
                         <option value="5+3">5+3</option>
                         <option value="5min">5 min</option>
                       </optgroup>
                       <optgroup label="Rapide">
                         <option value="10min">10 min</option>
                         <option value="10+0">10+0</option>
                         <option value="10+5">10+5</option>
                         <option value="15+10">15+10</option>
                         <option value="30+0">30 min</option>
                         <option value="30+20">30+20</option>
                       </optgroup>
                       <optgroup label="Classique">
                         <option value="60+0">60 min</option>
                         <option value="90+30">90+30</option>
                       </optgroup>
                     </select>
                   </div>
                </div>
              </div>

              {/* Digital Scoreboard */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Score en direct</div>
                <div className="flex items-center gap-12 text-6xl font-black font-mono tracking-tighter">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">{liveUserScore}</span>
                    </div>
                    <span className="text-slate-700 text-4xl">:</span>
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">{liveOpponentScore}</span>
                    </div>
                </div>
                <div className="flex w-full justify-between px-12 mt-4 text-xs font-bold uppercase tracking-wider opacity-80">
                   <div className="flex items-center gap-2 text-green-400">
                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Moi
                   </div>
                   <div className="flex items-center gap-2 text-red-400">
                     <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div> {currentOpponentName}
                   </div>
                </div>
              </div>

              {/* Matches List */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <h4 className="font-bold text-gray-700">Liste des parties</h4>
                    <span className="text-xs text-gray-400 font-medium">{matches.length} parties ajoutées</span>
                 </div>
                 
                 {matches.map((match, idx) => (
                   <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group hover:border-blue-300 hover:shadow-md transition-all animate-fade-in-up">
                     <button 
                      onClick={() => removeMatch(idx)}
                      className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1"
                      title="Supprimer la partie"
                     >
                       <X size={16} />
                     </button>
                     
                     <div className="flex flex-col sm:flex-row gap-4 items-center">
                       <div className="w-full sm:w-auto flex items-center gap-3 min-w-[100px]">
                         <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm">
                           {match.number}
                         </span>
                         <span className="font-semibold text-gray-700 text-sm">Partie {match.number}</span>
                       </div>

                       {/* Result Buttons - Segmented Control Style */}
                       <div className="flex-1 w-full grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg">
                         <button 
                          onClick={() => updateMatch(idx, 'result', 'win')}
                          className={`py-2 rounded-md text-sm font-bold transition-all shadow-sm ${match.result === 'win' ? 'bg-green-500 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                         >
                           Victoire
                         </button>
                         <button 
                          onClick={() => updateMatch(idx, 'result', 'draw')}
                          className={`py-2 rounded-md text-sm font-bold transition-all shadow-sm ${match.result === 'draw' ? 'bg-gray-500 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                         >
                           Nul
                         </button>
                         <button 
                          onClick={() => updateMatch(idx, 'result', 'loss')}
                          className={`py-2 rounded-md text-sm font-bold transition-all shadow-sm ${match.result === 'loss' ? 'bg-red-500 text-white' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                         >
                           Défaite
                         </button>
                       </div>

                       {/* Extra Stats - Compact */}
                       <div className="flex gap-2 w-full sm:w-auto">
                          <div className="relative flex-1">
                            <input 
                              type="number" 
                              min="0" max="100"
                              value={match.accuracy || ''}
                              onChange={(e) => updateMatch(idx, 'accuracy', parseFloat(e.target.value))}
                              placeholder="Préc. %"
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                              title="Précision (%)"
                            />
                          </div>
                          <div className="relative flex-1">
                            <input 
                              type="number" 
                              value={match.estimatedRating || ''}
                              onChange={(e) => updateMatch(idx, 'estimatedRating', parseInt(e.target.value))}
                              placeholder="Rating"
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                              title="Performance Rating"
                            />
                          </div>
                       </div>
                     </div>
                   </div>
                 ))}

                 <button 
                    onClick={handleAddMatch}
                    className="w-full py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-primary hover:border-primary hover:bg-blue-50 transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Ajouter une partie
                 </button>
              </div>

            </div>

            <div className="p-6 border-t border-gray-200 bg-white flex gap-4">
               <button 
                 onClick={() => { setIsOpenModal(false); resetForm(); }}
                 className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
               >
                 Annuler
               </button>
               <button 
                 onClick={handleSaveSession}
                 className="flex-1 py-3 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
               >
                 Enregistrer
               </button>
            </div>
          </div>
        </div>
      )}

      {/* SESSION DETAILS MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-4 border-b bg-white flex justify-between items-center sticky top-0 z-10">
                <h3 className="font-bold text-lg text-gray-800">Détails de la Session</h3>
                <button onClick={() => setSelectedSession(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                  <X size={20} />
                </button>
             </div>
             
             <div className="p-6 overflow-y-auto custom-scrollbar">
                {/* Header Info */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-3">
                    {selectedSession.opponentName.substring(0,2).toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">{selectedSession.opponentName}</h2>
                  <div className="flex items-center gap-2 mt-2 text-sm font-medium text-gray-500">
                     <span>{new Date(selectedSession.date).toLocaleDateString()}</span>
                     <span>•</span>
                     <span className="text-primary bg-blue-50 px-2 py-0.5 rounded">{selectedSession.gameType}</span>
                     <span>•</span>
                     <span>{selectedSession.timeControl}</span>
                  </div>
                </div>

                {/* Scoreboard Mini */}
                <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md mb-6 flex justify-center items-center gap-8">
                   <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">{selectedSession.userScore}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Moi</div>
                   </div>
                   <div className="text-2xl text-slate-600 font-light">vs</div>
                   <div className="text-center">
                      <div className="text-3xl font-bold text-red-400">{selectedSession.opponentScore}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Adv.</div>
                   </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                   <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                     <div className="text-xl font-bold text-green-600">{selectedSession.wins}</div>
                     <div className="text-xs text-green-700 font-bold uppercase">Victoires</div>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                     <div className="text-xl font-bold text-gray-600">{selectedSession.draws}</div>
                     <div className="text-xs text-gray-500 font-bold uppercase">Nuls</div>
                   </div>
                   <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                     <div className="text-xl font-bold text-red-500">{selectedSession.losses}</div>
                     <div className="text-xs text-red-700 font-bold uppercase">Défaites</div>
                   </div>
                </div>

                <h4 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={14} /> Chronologie des parties
                </h4>
                <div className="space-y-2">
                   {selectedSession.matches.map((m, i) => (
                     <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                           <span className="w-6 h-6 rounded bg-gray-100 text-xs font-bold flex items-center justify-center text-gray-500">{m.number}</span>
                           <div>
                              <div className={`text-sm font-bold ${
                                m.result === 'win' ? 'text-green-600' : 
                                m.result === 'loss' ? 'text-red-500' : 'text-gray-500'
                              }`}>
                                {m.result === 'win' ? 'Victoire' : m.result === 'loss' ? 'Défaite' : 'Nul'}
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Display Accuracy/Rating if exists */}
                          {(m.accuracy || m.estimatedRating) && (
                             <div className="flex gap-2 text-xs">
                               {m.accuracy && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{m.accuracy}%</span>}
                               {m.estimatedRating && <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100">{m.estimatedRating}</span>}
                             </div>
                          )}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                <button 
                  onClick={() => setSessionToDelete(selectedSession)}
                  className="text-red-500 text-sm font-bold hover:underline flex items-center justify-center gap-2 w-full"
                >
                  <Trash2 size={14} /> Supprimer cette session
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
