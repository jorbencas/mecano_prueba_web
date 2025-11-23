import React, { useState, useEffect } from 'react';
import TypingArea from './TypingArea';
import Hands from './Hands';
import ErrorModal from './ErrorModal';
import Keyboard from './Keyboard';
import Stats from './Stats';
import MenuLevels from './MenuLevels';
import InstruccionesButton from './Instrucciones';
import { getStatsData } from '../utils/getStatsData';
import sampleTexts from '../data/texts.json';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';
import { useTheme } from '../context/ThemeContext';

interface Level {
  keys: string[];
  name: string;
  text: string;
  wpmGoal: number;
  errorLimit: number;
}

const CreateText: React.FC = () => {
  const { t } = useDynamicTranslations();
  const { isDarkMode } = useTheme();
  
  const [texts, setTexts] = useState<Level[]>(sampleTexts);
  const [selectedText, setSelectedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextKey, setNextKey] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState<{ [key: number]: { expected: string; actual: string } }>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [errorList, setErrorList] = useState<{ expected: string; actual: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    const storedTexts = localStorage.getItem('texts');
    if (storedTexts) {
      const parsedTexts = JSON.parse(storedTexts);
      setTexts(parsedTexts);
      // Set initial text on mount
      if (parsedTexts.length > 0 && !selectedText) {
        setSelectedText(parsedTexts[0].text);
        setNextKey(parsedTexts[0].text[0].toLowerCase());
      }
    } else if (sampleTexts.length > 0 && !selectedText) {
      // If no stored texts, use first sample text
      setSelectedText(sampleTexts[0].text);
      setNextKey(sampleTexts[0].text[0].toLowerCase());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('texts', JSON.stringify(texts));
  }, [texts]);

  const handleKeyPress = (key: string) => {
    if (!selectedText) return;

    const expectedKey = selectedText[currentIndex].toLowerCase();

    if (key.toLowerCase() === expectedKey) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (newIndex < selectedText.length) {
        setNextKey(selectedText[newIndex].toLowerCase());
      } else {
        setNextKey('');
        finishInput();
      }
    } else {
      setErrors(prev => ({
        ...prev,
        [currentIndex]: { expected: expectedKey, actual: key },
      }));
    }
    updateAccuracy();
  };

  const updateAccuracy = () => {
    const errorCount = Object.keys(errors).length;
    setAccuracy(currentIndex > 0 ? Math.round(((currentIndex - errorCount) / currentIndex) * 100) : 100);
  };

  const finishInput = () => {
    const errorDetails = Object.entries(errors).map(([_, error]) => ({
      expected: error.expected,
      actual: error.actual,
    }));

    const totalWords = selectedText.split(' ').length;
    const timeTakenInSeconds = (currentIndex / selectedText.length) * totalWords;
    const calculatedWPM = Math.round((totalWords / timeTakenInSeconds) || 0);

    setWpm(calculatedWPM);
    setErrorList(errorDetails);

    resetInput();
    setShowStatsModal(true);
  };

  const resetInput = () => {
    setSelectedText('');
    setCurrentIndex(0);
    setErrors({});
    setNextKey('');
  };

  const handleAddNewText = (text: string, wpmGoal: number = 60, errorLimit: number = 5) => {
    const newLevel: Level = {
      keys: text.split(''),
      name: `${t('createText.newText')} ${texts.length + 1}`,
      text: text,
      wpmGoal: wpmGoal,
      errorLimit: errorLimit,
    };
    setTexts(prev => [...prev, newLevel]);
    setSelectedText(text);
    setNextKey(text[0].toLowerCase());
    setCurrentIndex(0);
    setErrors({});
  };

  const handleLevelChange = (index: number) => {
    setCurrentLevel(index);
    setSelectedText(texts[index].text);
    setNextKey(texts[index].text[0].toLowerCase());
    setCurrentIndex(0);
    setErrors({});
  };

  return (
    <div className="container mx-auto p-4 flex">
      <MenuLevels
        source="CreateText"
        onLevelChange={handleLevelChange}
        onCreateNewText={handleAddNewText}
        currentLevel={currentLevel}
        levels={texts}
      />

      <div className="w-3/4">
        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {t('createText.title', 'Escribe el Texto Seleccionado')}
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
          instructions={t(
            'createText.instructions',
            'Escribe el texto seleccionado con precisión. Evita errores y mantén el ritmo.'
          )}
          source="CreateText"
        />

        {showStatsModal && (
          <ErrorModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
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
          </ErrorModal>
        )}
      </div>
    </div>
  );
};

export default CreateText;
