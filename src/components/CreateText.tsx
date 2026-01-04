import React, { useState, useEffect } from 'react';
import Hands from './Hands';
import BaseModal from './BaseModal';
import Keyboard from './Keyboard';
import Stats from './Stats';
import MenuLevels from './MenuLevels';
import InstruccionesButton from './Instrucciones';
import { getStatsData } from '@/utils/getStatsData';
import sampleTexts from '@/data/texts.json';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { useTheme } from '@hooks/useTheme';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { GameSource } from '@/types/enums';


const CreateText: React.FC = () => {
  const { t } = useDynamicTranslations();
  const { isDarkMode } = useTheme();
  const { startTracking } = useActivityTracker('CreateText', 'createText');
  
  const texts = sampleTexts;
  const [selectedText, setSelectedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextKey, setNextKey] = useState('');
  const [wpm] = useState(0);
  const [accuracy] = useState(100);
  const [errors, setErrors] = useState<{ [key: number]: { expected: string; actual: string } }>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [errorList] = useState<{ expected: string; actual: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    // Initialize with sample texts
    if (sampleTexts.length > 0 && !selectedText) {
      setSelectedText(sampleTexts[0].text);
      setNextKey(sampleTexts[0].text[0].toLowerCase());
    }
  }, []);









  const handleLevelChange = (index: number) => {
    setCurrentLevel(index);
    setSelectedText(texts[index].text);
    setNextKey(texts[index].text[0].toLowerCase());
    setCurrentIndex(0);
    setErrors({});
    startTracking();
  };

  return (
    <div className="container mx-auto p-4 flex">
      <MenuLevels
        source={GameSource.CREATE_TEXT}
        onLevelChange={handleLevelChange}
        currentLevel={currentLevel}
        levels={texts}
      />

      <div className="w-3/4">
        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {t('createText.title')}
        </h1>

        <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {texts[currentLevel]?.name || t('createText.noTextSelected')}
            </h2>
            <span className={`text-sm font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              {t('createText.progress')}: {currentIndex}/{selectedText.length}
            </span>
          </div>
          
          <div className={`flex flex-col sm:flex-row justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p className="inline-block mr-0 sm:mr-4 text-lg">
              {t('typingArea.stats.wpm')}: {wpm}
            </p>
            <p className="inline-block mr-0 sm:mr-4 text-lg">
              {t('typingArea.stats.accuracy')}: {accuracy}%
            </p>
            <p className="inline-block text-lg">
              {t('typingArea.stats.errors')}: {Object.keys(errors).length}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          <p
            className={`text-lg font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:text-xl lg:text-2xl border-2 border-gray-300 rounded-lg p-4 min-h-[6rem] h-auto whitespace-pre-wrap break-words`}
          >
            {selectedText.split('').map((char, index) => (
              <span
                key={index}
                className={
                  index < currentIndex
                    ? 'text-green-500'
                    : index === currentIndex
                    ? 'font-bold text-blue-500'
                    : ''
                }
              >
                {char}
              </span>
            ))}
          </p>
        </div>

        <Keyboard activeKey={nextKey} levelKeys={[]} isFullKeyboard />

        <Hands nextKey={nextKey} />
        <InstruccionesButton
          instructions={t('createText.instructions')}
          source={GameSource.CREATE_TEXT}
        />

        {showStatsModal && (
          <BaseModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
            <Stats
              stats={getStatsData({
                wpm,
                accuracy,
                level: currentLevel + 1,
                errors: Object.keys(errors).length,
                elapsedTime: 0,
                levelCompleted: true,
                levelData: {
                  wpmGoal: texts[currentLevel]?.wpmGoal || 0,
                  errorLimit: texts[currentLevel]?.errorLimit || 0,
                },
                text: '',
              })}
              errorList={errorList}
              onRepeatLevel={() => setShowStatsModal(false)}
              onNextLevel={() => {}}
              sourceComponent="CreateText"
            />
          </BaseModal>
        )}
      </div>
    </div>
  );
};

export default CreateText;
