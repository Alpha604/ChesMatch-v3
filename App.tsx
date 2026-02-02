
import React, { useState, useEffect } from 'react';
import { User, Player, Session, AppSettings, View } from './types';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Players } from './components/Players';
import { Sessions } from './components/Sessions';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { AdminPanel } from './components/AdminPanel';

// Mock Initial Data
const INITIAL_ADMIN: User = {
  id: 1,
  username: 'admin',
  password: 'admin123', // In real app, this would be hashed
  type: 'admin',
  approved: true,
  blocked: false,
  createdAt: new Date().toISOString()
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  notifications: true,
  autoLogout: true,
  soundEffects: true
};

const App: React.FC = () => {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [users, setUsers] = useState<User[]>([INITIAL_ADMIN]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // UI State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    const loadData = () => {
      const savedUsers = localStorage.getItem('chessUsers');
      const savedPlayers = localStorage.getItem('chessPlayers');
      const savedSessions = localStorage.getItem('chessSessions');
      const savedSettings = localStorage.getItem('chessSettings');
      
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      
      if (savedPlayers) {
         const loadedPlayers = JSON.parse(savedPlayers);
         // MIGRATION: Assign legacy data (undefined userId) to Admin (ID 1)
         const migratedPlayers = loadedPlayers.map((p: any) => ({
           ...p,
           userId: p.userId ?? INITIAL_ADMIN.id
         }));
         setPlayers(migratedPlayers);
      }

      if (savedSessions) {
         const loadedSessions = JSON.parse(savedSessions);
         // MIGRATION: Assign legacy data (undefined userId) to Admin (ID 1)
         const migratedSessions = loadedSessions.map((s: any) => ({
           ...s,
           userId: s.userId ?? INITIAL_ADMIN.id
         }));
         setSessions(migratedSessions);
      }

      if (savedSettings) setSettings(JSON.parse(savedSettings));
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('chessUsers', JSON.stringify(users));
    localStorage.setItem('chessPlayers', JSON.stringify(players));
    localStorage.setItem('chessSessions', JSON.stringify(sessions));
    localStorage.setItem('chessSettings', JSON.stringify(settings));
  }, [users, players, sessions, settings]);

  // --- Filter Data by User ---
  // Only the currentUser's players and sessions should be visible in the main app
  const currentUserPlayers = currentUser ? players.filter(p => p.userId === currentUser.id) : [];
  const currentUserSessions = currentUser ? sessions.filter(s => s.userId === currentUser.id) : [];

  // --- Handlers ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddPlayer = (playerData: { name: string, rating: number, avatarColor?: string, playStyle?: string, description?: string }) => {
    if (!currentUser) return;
    const newPlayer: Player = {
      id: Date.now(),
      userId: currentUser.id, // Linked to current user
      name: playerData.name,
      rating: playerData.rating,
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      certified: false,
      avatarColor: playerData.avatarColor || 'blue',
      playStyle: playerData.playStyle || 'Polyvalent',
      description: playerData.description || ''
    };
    setPlayers([...players, newPlayer]);
  };

  const handleDeletePlayer = (id: number) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleToggleCertify = (id: number) => {
    setPlayers(players.map(p => p.id === id ? { ...p, certified: !p.certified } : p));
  };

  const handleAddSession = (sessionData: Omit<Session, 'id'>) => {
    if (!currentUser) return;
    const newSession: Session = {
      ...sessionData,
      id: Date.now(),
      userId: currentUser.id
    };
    
    setSessions([...sessions, newSession]);

    // Update Player Stats
    setPlayers(players.map(p => {
      if (p.id === newSession.opponentId) {
        return {
          ...p,
          games: p.games + newSession.matches.length,
          wins: p.wins + newSession.losses, 
          losses: p.losses + newSession.wins,
          draws: p.draws + newSession.draws,
          rating: p.rating + (newSession.losses * 5) - (newSession.wins * 5)
        };
      }
      return p;
    }));
  };

  const handleDeleteSession = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  // --- Admin Handlers ---
  const handleApproveUser = (id: number) => {
      setUsers(users.map(u => u.id === id ? { ...u, approved: true } : u));
  };

  const handleBlockUser = (id: number) => {
      setUsers(users.map(u => u.id === id ? { ...u, blocked: !u.blocked } : u));
  };

  const handleDeleteUser = (id: number) => {
      setUsers(users.filter(u => u.id !== id));
      // Cleanup data associated with user
      setPlayers(players.filter(p => p.userId !== id));
      setSessions(sessions.filter(s => s.userId !== id));
  };

  const handleResetData = () => {
    if (confirm("Êtes-vous sûr de vouloir tout supprimer (vos données) ?")) {
      if (currentUser?.type === 'admin') {
         // Admin resets everything
         setPlayers([]);
         setSessions([]);
         setUsers([INITIAL_ADMIN]);
      } else {
         // User only resets their own data
         if (currentUser) {
            setPlayers(players.filter(p => p.userId !== currentUser.id));
            setSessions(sessions.filter(s => s.userId !== currentUser.id));
         }
      }
    }
  };

  const handleExportData = () => {
    const dataToExport = currentUser?.type === 'admin' 
        ? { users, players, sessions, settings } // Admin exports all
        : { 
            users: [currentUser], 
            players: currentUserPlayers, 
            sessions: currentUserSessions, 
            settings 
          }; // User exports own data

    const dataStr = JSON.stringify({ ...dataToExport, version: "1.0", exportDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chessmatch-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.users && Array.isArray(json.users)) {
             if (currentUser?.type === 'admin') setUsers(json.users);
        }
        if (json.players && Array.isArray(json.players)) {
             // Migration on Import as well
             const importedPlayers = json.players.map((p: any) => ({ ...p, userId: p.userId ?? currentUser?.id }));
             setPlayers(prev => [...prev.filter(p => p.userId !== currentUser?.id), ...importedPlayers]);
        }
        if (json.sessions && Array.isArray(json.sessions)) {
             const importedSessions = json.sessions.map((s: any) => ({ ...s, userId: s.userId ?? currentUser?.id }));
             setSessions(prev => [...prev.filter(s => s.userId !== currentUser?.id), ...importedSessions]);
        }
        if (json.settings) setSettings(json.settings);

        alert("Importation réussie !");
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'importation du fichier. Vérifiez le format JSON.");
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // --- Render ---

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} onRegister={(u) => setUsers([...users, u])} />;
  }

  return (
    <Layout 
      user={currentUser} 
      currentView={view} 
      onChangeView={setView} 
      onLogout={handleLogout}
      soundEnabled={settings.soundEffects}
      toggleSound={() => setSettings({...settings, soundEffects: !settings.soundEffects})}
    >
      {view === 'dashboard' && (
        <Dashboard 
          user={currentUser} 
          players={currentUserPlayers} 
          sessions={currentUserSessions}
          onNavigate={setView}
          onOpenSessionModal={() => { setView('sessions'); setIsSessionModalOpen(true); }}
          onOpenPlayerModal={() => setView('players')}
        />
      )}
      
      {view === 'players' && (
        <Players 
          user={currentUser}
          players={currentUserPlayers}
          sessions={currentUserSessions}
          onAddPlayer={handleAddPlayer}
          onDeletePlayer={handleDeletePlayer}
          onToggleCertify={handleToggleCertify}
        />
      )}

      {view === 'sessions' && (
        <Sessions 
          players={currentUserPlayers}
          sessions={currentUserSessions}
          onAddSession={handleAddSession}
          onDeleteSession={handleDeleteSession}
          isOpenModal={isSessionModalOpen}
          setIsOpenModal={setIsSessionModalOpen}
        />
      )}

      {view === 'stats' && (
        <Stats sessions={currentUserSessions} />
      )}

      {view === 'admin' && currentUser.type === 'admin' && (
          <AdminPanel 
            users={users} 
            onApprove={handleApproveUser}
            onBlock={handleBlockUser}
            onDelete={handleDeleteUser}
            currentUserId={currentUser.id}
          />
      )}

      {view === 'settings' && (
        <Settings 
          settings={settings}
          onUpdateSettings={setSettings}
          onResetData={handleResetData}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />
      )}
    </Layout>
  );
};

export default App;
