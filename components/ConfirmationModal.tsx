
import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-scale-in border border-gray-100">
        
        {/* Header Visual */}
        <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-gray-800 text-center leading-tight">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-gray-500 text-sm leading-relaxed mb-2">
            {message}
          </div>
          <p className="text-xs text-red-400 font-semibold mt-4 bg-red-50 py-2 px-3 rounded-lg inline-block">
             <span className="mr-1">⚠️</span> Cette action est irréversible.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2.5 px-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
