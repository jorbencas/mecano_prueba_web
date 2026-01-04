import React, { useState } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { FaUserShield, FaCamera } from 'react-icons/fa';
import { Check, X, Copy, Check as CopyCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const ProfileCard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, updateUser, isAdmin } = useAuth();
  const { t } = useDynamicTranslations();
  const { handleError } = useErrorHandler();

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user?.photoURL || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleUpdateAvatar = async () => {
    if (!newAvatarUrl.trim()) return;
    setIsUpdating(true);
    try {
      await updateUser({ photoURL: newAvatarUrl });
      setIsEditingAvatar(false);
    } catch (error) {
      handleError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 rounded-none border backdrop-blur-sm lg:col-span-1 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50 shadow-sm'}`}>
      <div className="flex flex-col items-center text-center">
        <div className="relative group/avatar mb-4">
          <div className={`w-24 h-24 rounded-none border-2 p-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`w-full h-full rounded-none overflow-hidden flex items-center justify-center text-3xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
              ) : (
                <FaUserShield className="text-gray-400" />
              )}
            </div>
          </div>
          <button 
            onClick={() => {
              setIsEditingAvatar(true);
              setNewAvatarUrl(user.photoURL || '');
            }}
            className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-none border border-white/20 shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity"
          >
            <FaCamera size={12} />
          </button>
        </div>

        {isEditingAvatar && (
          <div className="mb-4 w-full animate-fade-in">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                placeholder="URL de imagen"
                className={`flex-grow px-2 py-1 text-xs rounded-none border ${
                  isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
                }`}
              />
              <button 
                onClick={handleUpdateAvatar}
                disabled={isUpdating}
                className="p-1 bg-green-600 text-white rounded-none disabled:opacity-50"
              >
                <Check size={14} />
              </button>
              <button 
                onClick={() => setIsEditingAvatar(false)}
                className="p-1 bg-red-600 text-white rounded-none"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        <h2 className={`text-xl font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {user.displayName || user.email?.split('@')[0]}
        </h2>
        <p className={`text-xs font-medium mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {user.email}
        </p>
        <span className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border ${
          isAdmin
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
            : 'bg-green-500/10 border-green-500/30 text-green-500'
        }`}>
          {isAdmin ? t('userProfile.admin') : t('userProfile.student')}
        </span>
        
        <div className="mt-6 w-full pt-6 border-t border-gray-200/10 dark:border-gray-700/30 space-y-3">
          <Link to={`/profile/${user.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
            <FaUserShield /> {t('userProfile.publicProfile')}
          </Link>
          
          <button 
            onClick={handleCopyLink}
            className={`w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
              isDarkMode 
                ? 'bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white hover:border-blue-500' 
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300'
            }`}
          >
            {copied ? <CopyCheck size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? t('common.copied', 'Copiado') : t('userProfile.copyLink', 'Copiar Enlace')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
