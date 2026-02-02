
import React, { useState } from 'react';
import { User } from '../types';
import { CheckCircle, XCircle, Trash2, Shield, ShieldAlert, User as UserIcon, Lock } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface AdminPanelProps {
  users: User[];
  onApprove: (id: number) => void;
  onBlock: (id: number) => void;
  onDelete: (id: number) => void;
  currentUserId: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onApprove, onBlock, onDelete, currentUserId }) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 border-b pb-4 mb-6 border-gray-200">
        <ShieldAlert className="text-warning" size={28} />
        <div>
            <h2 className="text-2xl font-bold text-dark">Administration</h2>
            <p className="text-gray-500 text-sm">Gérez les accès et les utilisateurs de la plateforme.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Utilisateur</th>
                <th className="p-4 font-semibold">Rôle</th>
                <th className="p-4 font-semibold">Date Création</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${user.type === 'admin' ? 'bg-amber-500' : 'bg-primary'}`}>
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{user.username}</div>
                        <div className="text-xs text-gray-400">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {user.type === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                            <Shield size={12} /> Admin
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                            <UserIcon size={12} /> Joueur
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500 font-mono">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {user.blocked ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold text-sm">
                            <Lock size={14} /> Bloqué
                        </span>
                    ) : user.approved ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-bold text-sm">
                            <CheckCircle size={14} /> Actif
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-orange-500 font-bold text-sm animate-pulse">
                            <ClockIcon /> En attente
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        {user.id !== currentUserId && (
                            <>
                                {!user.approved && !user.blocked && (
                                    <button 
                                        onClick={() => onApprove(user.id)}
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                                        title="Approuver l'utilisateur"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => onBlock(user.id)}
                                    className={`p-2 rounded-lg transition-colors border ${user.blocked ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                                    title={user.blocked ? "Débloquer" : "Bloquer l'accès"}
                                >
                                    {user.blocked ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                </button>

                                <button 
                                    onClick={() => setUserToDelete(user)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                    title="Supprimer le compte"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
                        {user.id === currentUserId && (
                            <span className="text-xs text-gray-400 italic py-2 pr-2">Vous</span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
             onDelete(userToDelete.id);
          }
        }}
        title="Supprimer l'utilisateur"
        message={
          <span>
            Êtes-vous sûr de vouloir supprimer le compte <strong>{userToDelete?.username}</strong> ?<br/>
            Cette action est irréversible et supprimera toutes ses données.
          </span>
        }
      />
    </div>
  );
};

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
