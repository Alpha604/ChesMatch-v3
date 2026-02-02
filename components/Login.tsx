
import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, Crown, AlertCircle } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

// Simple Chess Knight Icon SVG to replace FontAwesome
const ChessKnightLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={className}>
    <path d="M127.8 288c12.6 1.8 24.3-3.2 27.6-13.7 2.1-6.6-1.5-16.1-9.9-20.9-10.4-5.9-19-4.8-22.3 5.9-2.9 9.3 0 19.9 4.6 28.7zm283.4-38.6c-4.4-23.8-31.5-29.2-35.8-5.3-2 11.2-12.7 18.2-22.6 15.1-9.8-3.1-15-13.8-11.2-23.7 13.9-35.9 66.7-38.3 84.8 6.5 13.4 33.1-23.4 46.1-3.6 77.2 4 6.3 11 10.3 18.6 10.3 12.3 0 22.3-10 22.3-22.3v-58.4c0-34.9-31.6-61.1-65.7-55.8-19.1 3-36.6 14.8-46.3 31.7l-4.7 8.1c-14.7 25.5-2.2 58.1 24.1 63.1 3.5.7 7.1-1.3 7.8-4.8 1.4-6.8-2.6-13.5-9-15.3-11.4-3.2-16.7-17.6-10.2-27.4l4.7-8.1c4.2-7.3 11.9-12.5 20.3-13.8 14.7-2.3 28.3 9 28.3 24.2v25.2c0 2.2-1.8 4-4 4-2.2 0-4-1.8-4-4v-5.2c0-8.8-7.2-16-16-16-8.8 0-16 7.2-16 16v18.1c0 29.4-20.9 54.3-49.8 59.4l-11.2 2c-35.2 6.2-57.6 44.5-43.1 77.3l2.8 6.4c10.4 23.5 33.5 38.6 59.2 38.6h125.7c22 0 41.5-14.5 48.1-35.7l12.3-39.6c4-12.9-1.3-27.1-12.6-33.8zM256 128c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm-64 224c0-17.7-14.3-32-32-32s-32 14.3-32 32 14.3 32 32 32 32-14.3 32-32z"/>
  </svg>
);

export const Login: React.FC<LoginProps> = ({ users, onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (users.some(u => u.username === username)) {
        setError('Cet identifiant existe déjà.');
        return;
      }
      const newUser: User = {
        id: Date.now(),
        username,
        password,
        type: 'user',
        approved: false, // Default requires approval mock
        blocked: false,
        createdAt: new Date().toISOString()
      };
      onRegister(newUser);
      alert("Compte créé ! Votre compte est en attente d'approbation par un administrateur.");
      setIsRegistering(false);
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        if (user.blocked) {
          setError('Ce compte a été bloqué par un administrateur.');
          return;
        }
        if (!user.approved) {
           setError("Ce compte est en attente d'approbation.");
           return;
        }
        onLogin(user);
      } else {
        setError('Identifiants incorrects.');
      }
    }
  };

  const quickAdminLogin = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
             <ChessKnightLogo className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">ChessMatch</h1>
          <p className="text-gray-500 mt-2">Gestionnaire de sessions & statistiques</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="votre_pseudo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
            {isRegistering ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button 
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-sm text-primary hover:underline text-center font-medium"
          >
            {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
          </button>
          
          <div className="relative my-2">
             <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
             </div>
             <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">Ou</span>
             </div>
          </div>

          <button
            type="button"
            onClick={quickAdminLogin}
            className="w-full py-2 px-4 bg-amber-100 text-amber-700 font-bold rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Crown size={16} />
            Démo Admin (admin/admin123)
          </button>
        </div>
      </div>
    </div>
  );
};
