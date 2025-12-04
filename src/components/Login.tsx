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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-black' 
        : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-indigo-50 to-slate-100'
    }`}>
      
      {/* Decorative background blobs */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none`}>
        <div className={`absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob ${isDarkMode ? 'bg-blue-900' : 'bg-blue-200'}`}></div>
        <div className={`absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-200'}`}></div>
        <div className={`absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-200'}`}></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {/* Left side - Instructions */}
        <div className="flex items-center lg:pr-8 animate-in slide-in-from-left-10 duration-700 fade-in">
          <div className="w-full">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-8 tracking-tight">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-blue-400 via-purple-400 to-indigo-400' : 'from-blue-600 via-purple-600 to-indigo-600'}`}>
                {t('login.welcome', 'Bienvenido a Mecano')}
              </span>
            </h1>
            
            {/* Glassmorphic Info Card */}
            <div className={`p-8 rounded-2xl mb-8 backdrop-blur-md border shadow-lg transition-all duration-300 hover:transform hover:scale-[1.02] ${
              isDarkMode 
                ? 'bg-gray-800/40 border-gray-700/50 text-gray-200' 
                : 'bg-white/60 border-white/50 text-gray-700'
            }`}>
              <p className="text-lg leading-relaxed font-medium">
                {t('login.inviteText', 
                  '¿Listo para mejorar tu velocidad de escritura? Únete a nuestra comunidad y descubre todo tu potencial. ' +
                  'Con Mecano, no solo practicas mecanografía, sino que mides tu progreso, compites con otros usuarios y desbloqueas logros mientras mejoras. ' +
                  '¡Empieza ahora y ve cómo tus habilidades crecen día a día!'
                )}
              </p>
            </div>
            
            <div className="mt-8">
              <BenefitsList />
            </div>
          </div>
        </div>

        {/* Right side - Login/Register Form */}
        <div className="flex items-center justify-center animate-in slide-in-from-right-10 duration-700 fade-in delay-150">
          <div className={`w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700/50 shadow-black/50' 
              : 'bg-white/80 border-white/60 shadow-blue-100/50'
          }`}>
            {/* Tab Switcher */}
            <div className={`flex mb-8 p-1 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100/80'}`}>
              <button
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  !isRegister 
                    ? isDarkMode ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-blue-600 shadow-md' 
                    : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('login.loginTab', 'Iniciar Sesión')}
              </button>
              <button
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isRegister 
                    ? isDarkMode ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-blue-600 shadow-md' 
                    : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('login.registerTab', 'Registrarse')}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div className="group">
                  <label className={`block mb-2 text-sm font-bold ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('login.displayName', 'Nombre')}
                  </label>
                  <div className="relative transition-all duration-200 group-focus-within:transform group-focus-within:scale-[1.02]">
                    <div className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-900' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10'
                      }`}
                      placeholder={t('login.displayNamePlaceholder', 'Tu nombre')}
                      required={isRegister}
                    />
                  </div>
                </div>
              )}

              <div className="group">
                <label className={`block mb-2 text-sm font-bold ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('login.email', 'Email')}
                </label>
                <div className="relative transition-all duration-200 group-focus-within:transform group-focus-within:scale-[1.02]">
                  <div className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-900' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10'
                    }`}
                    placeholder="ejemplo@email.com"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className={`block mb-2 text-sm font-bold ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('login.password', 'Contraseña')}
                </label>
                <div className="relative transition-all duration-200 group-focus-within:transform group-focus-within:scale-[1.02]">
                  <div className={`absolute left-4 top-3.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-900' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10'
                    }`}
                    placeholder="••••••"
                    required
                    minLength={6}
                  />
                </div>
                <p className={`text-xs mt-2 ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('login.passwordHint', 'Mínimo 6 caracteres')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  loading 
                    ? 'bg-gray-500 cursor-wait' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login.loading', 'Procesando...')}
                  </span>
                ) : (
                  isRegister ? t('login.registerButton', 'Crear Cuenta') : t('login.loginButton', 'Entrar')
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-4 font-medium ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'}`}>
                    {t('login.or', 'o continúa con')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`mt-6 w-full py-3.5 border rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-900/50 hover:bg-gray-800 text-white hover:shadow-lg hover:shadow-black/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:shadow-lg hover:shadow-gray-200/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaGoogle className={isDarkMode ? 'text-white' : 'text-red-500'} />
                {t('login.googleButton', 'Google')}
              </button>
            </div>

            {/* Back link integrated at the bottom */}
            {onBack && (
              <div className={`mt-8 pt-6 border-t text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <button
                  onClick={onBack}
                  className={`text-sm font-medium hover:underline transition-colors flex items-center justify-center gap-2 mx-auto ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>←</span> {t('login.back', 'Volver a la aplicación')}
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
