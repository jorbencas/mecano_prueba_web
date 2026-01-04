import React, { useState } from 'react';
import { FaChevronDown, FaLightbulb, FaGithub } from 'react-icons/fa';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { motion, AnimatePresence } from 'framer-motion';

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqItems = [
    { id: 'start', q: t('faq.questions.start_practice'), a: t('faq.answers.start_practice') },
    { id: 'register', q: t('faq.questions.register_needed'), a: t('faq.answers.register_needed') },
    { id: 'modes', q: t('faq.questions.modes_diff'), a: t('faq.answers.modes_diff') },
    { id: 'custom', q: t('faq.questions.custom_levels'), a: t('faq.answers.custom_levels') },
    { id: 'xp', q: t('faq.questions.earn_xp'), a: t('faq.answers.earn_xp') },
    { id: 'social', q: t('faq.questions.races_work'), a: t('faq.answers.races_work') },
  ];

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <footer className={`mt-20 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1">
            <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${isDarkMode ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>
              MecanoWeb
            </h2>
            <p className="text-sm leading-relaxed mb-6">
              Domina el arte de la mecanografía con nuestra plataforma interactiva. Mejora tu velocidad, precisión y compite con usuarios de todo el mundo.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors flex items-center gap-2">
                <FaGithub size={20} />
                <span className="text-sm font-medium">GitHub</span>
              </a>
            </div>
          </div>

          {/* FAQ Section - Spans 2 columns on large screens */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className={`text-xl font-black mb-8 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <FaLightbulb size={20} />
              </span>
              {t('faq.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`rounded-2xl border transition-all duration-300 self-start ${
                    openFaq === item.id
                      ? isDarkMode ? 'bg-gray-800 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-white border-blue-200 shadow-lg shadow-blue-500/5'
                      : isDarkMode ? 'bg-gray-800/40 border-gray-700/50 hover:border-gray-600' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(item.id)}
                    className="w-full flex items-center justify-between p-4 text-left group"
                  >
                    <span className={`font-bold text-sm transition-colors ${
                      openFaq === item.id 
                        ? 'text-blue-500' 
                        : isDarkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {item.q}
                    </span>
                    <div className={`p-1 rounded-md transition-all ${openFaq === item.id ? 'bg-blue-500 text-white rotate-180' : 'bg-gray-500/10'}`}>
                      <FaChevronDown size={10} />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className={`px-4 pb-5 text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="pt-2 border-t border-gray-500/10">
                            {item.a}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs italic opacity-60 text-center md:text-left">
              {t('faq.footer_tip')}
            </p>
          </div>
        </div>

        <div className={`pt-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} text-center text-xs opacity-60`}>
          <p>© {new Date().getFullYear()} MecanoWeb. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
