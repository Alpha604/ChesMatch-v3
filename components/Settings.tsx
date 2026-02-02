import React, { useRef } from 'react';
import { AppSettings } from '../types';
import { Moon, Bell, Power, Volume2, Save, RotateCcw, Upload } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, onResetData, onExportData, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSetting = (key: keyof AppSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark mb-6 border-b pb-4 border-gray-200">Paramètres</h2>
      
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Apparence & Comportement</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Moon size={20} className="text-primary" />
                <span className="font-medium">Mode Sombre (Simulé)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.darkMode} onChange={() => toggleSetting('darkMode')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-warning" />
                <span className="font-medium">Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.notifications} onChange={() => toggleSetting('notifications')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 size={20} className="text-secondary" />
                <span className="font-medium">Effets Sonores</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.soundEffects} onChange={() => toggleSetting('soundEffects')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Power size={20} className="text-danger" />
                <span className="font-medium">Déconnexion Auto (10min)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.autoLogout} onChange={() => toggleSetting('autoLogout')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Gestion des Données</h3>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onExportData}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <Save size={18} />
              Exporter JSON
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onImportData}
              accept=".json"
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Upload size={18} />
              Importer JSON
            </button>

            <button 
              onClick={onResetData}
              className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm ml-auto"
            >
              <RotateCcw size={18} />
              Réinitialiser tout
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            L'importation remplacera toutes les données actuelles. Assurez-vous d'avoir une sauvegarde si nécessaire.
          </p>
        </div>
      </div>
    </div>
  );
};