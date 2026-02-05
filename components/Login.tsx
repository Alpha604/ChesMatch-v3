
import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, Crown } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

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
             <i className="fa-solid fa-chess-knight text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">ChessMatch</h1>
          <p className="text-gray-500 mt-2">Gestionnaire de sessions & statistiques</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100 flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
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
