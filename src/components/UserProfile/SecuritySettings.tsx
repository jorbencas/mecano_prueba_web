import React, { useState } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { FaLock } from 'react-icons/fa';

const SecuritySettings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { changePassword } = useAuth();
  const { t } = useDynamicTranslations();

  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '' as 'success' | 'error', text: '' });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('profile.passwordsDontMatch') });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage({ type: '' as any, text: '' });
    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordMessage({ type: 'success', text: t('profile.passwordChanged') });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Error al cambiar contraseña' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={`p-6 rounded-none border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
      <h2 className={`text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <FaLock size={20} className="text-red-500" />
        {t('userProfile.security')}
      </h2>
      
      <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('profile.oldPassword')}
          </label>
          <input
            type="password"
            required
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
            className={`w-full px-4 py-2 rounded-none border ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
            }`}
          />
        </div>
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('profile.newPassword')}
          </label>
          <input
            type="password"
            required
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className={`w-full px-4 py-2 rounded-none border ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
            }`}
          />
        </div>
        <div>
          <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('profile.confirmPassword')}
          </label>
          <input
            type="password"
            required
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className={`w-full px-4 py-2 rounded-none border ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
            }`}
          />
        </div>
        
        {passwordMessage.text && (
          <p className={`text-xs font-bold ${passwordMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {passwordMessage.text}
          </p>
        )}
        
        <button
          type="submit"
          disabled={isChangingPassword}
          className="px-6 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isChangingPassword ? t('common.saving', 'Guardando...') : t('profile.updatePassword')}
        </button>
      </form>
    </div>
  );
};

export default SecuritySettings;
