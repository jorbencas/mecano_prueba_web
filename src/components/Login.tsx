import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { FaGoogle, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import BenefitsList from './BenefitsList';

interface LoginProps {
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack }) => {
  const { isDarkMode } = useTheme();
  const { login, register, loginWithGoogle, error: authError } = useAuth();
  const { t } = useDynamicTranslations();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
      // Success - AuthContext will update user state
      if (onBack) onBack();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Instructions */}
        <div className="flex items-center">
          <div className="w-full">
            <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {t('login.welcome', 'Bienvenido a Mecano')}
            </h1>
            
            {/* Natural inviting text */}
            <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('login.inviteText', 
                  '¿Listo para mejorar tu velocidad de escritura? Únete a nuestra comunidad y descubre todo tu potencial. ' +
                  'Con Mecano, no solo practicas mecanografía, sino que mides tu progreso, compites con otros usuarios y desbloqueas logros mientras mejoras. ' +
                  '¡Empieza ahora y ve cómo tus habilidades crecen día a día!'
                )}
              </p>
            </div>
            
            <div className="mt-6">
              <BenefitsList />
            </div>
          </div>
        </div>

        {/* Right side - Login/Register Form */}
        <div className="flex items-center">
          <div className={`w-full p-8 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Tab Switcher */}
            <div className="flex mb-6 border-b">
              <button
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className={`flex-1 pb-2 ${!isRegister ? 'border-b-2 border-blue-500 text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {t('login.loginTab', 'Iniciar Sesión')}
              </button>
              <button
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className={`flex-1 pb-2 ${isRegister ? 'border-b-2 border-blue-500 text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {t('login.registerTab', 'Registrarse')}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('login.displayName', 'Nombre')}
                  </label>
                  <div className="relative">
                    <FaUser className={`absolute left-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-black'
                      }`}
                      placeholder={t('login.displayNamePlaceholder', 'Tu nombre')}
                      required={isRegister}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('login.email', 'Email')}
                </label>
                <div className="relative">
                  <FaEnvelope className={`absolute left-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    placeholder="ejemplo@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('login.password', 'Contraseña')}
                </label>
                <div className="relative">
                  <FaLock className={`absolute left-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    placeholder="••••••"
                    required
                    minLength={6}
                  />
                </div>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('login.passwordHint', 'Mínimo 6 caracteres')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('login.loading', 'Cargando...') : isRegister ? t('login.registerButton', 'Crear Cuenta') : t('login.loginButton', 'Entrar')}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                    {t('login.or', 'o')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`mt-4 w-full py-3 border rounded font-semibold transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 hover:bg-gray-700 text-white'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaGoogle className="inline mr-2" />
                {t('login.googleButton', 'Continuar con Google')}
              </button>
            </div>

            {/* Back link integrated at the bottom */}
            {onBack && (
              <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600 text-center">
                <button
                  onClick={onBack}
                  className={`text-sm hover:underline transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ← {t('login.back', 'Volver a la aplicación')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
