import React, { useState, useEffect } from 'react';
import TypingArea from './TypingArea';
import Hands from './Hands';
import ErrorModal from './ErrorModal';
import Keyboard from './Keyboard';
import Stats from './Stats';
import MenuLevels from './MenuLevels';
import InstruccionesButton from './Instrucciones';
import { getStatsData } from '../utils/getStatsData';

interface Level {
  keys: string[];
  name: string;
  text: string;
  wpmGoal: number;
  errorLimit: number;
}

const CreateText: React.FC<{ }> = () => {
  const [texts, setTexts] = useState<Level[]>([]);
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
      setTexts(JSON.parse(storedTexts));
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
    let errorDetails = Object.entries(errors).map(([index, error]) => (
      { expected: error.expected, actual: error.actual }
    ));

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

  const handleAddNewText = (text: string) => {
    const newLevel: Level = {
      keys: text.split(''),
      name: `Texto ${texts.length + 1}`,
      text: text,
      wpmGoal: 60,
      errorLimit: 5
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
        <h1 className="text-3xl font-bold mb-4">Escribe el Texto Seleccionado</h1>
        
        <TypingArea 
          text={selectedText} 
          currentIndex={currentIndex} 
          onKeyPress={handleKeyPress} 
          wpm={wpm} 
          accuracy={accuracy} 
          errors={errors} 
        />

      <Keyboard activeKey={nextKey} levelKeys={[]} isFullKeyboard={true} />

        <Hands nextKey={nextKey} />
        <InstruccionesButton
          instructions="Presiona las teclas correctas antes de que caigan hasta el final. 
          Evita errores, mantén el ritmo y alcanza el WPM objetivo para subir de nivel."
          color="green"
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
              text: '', // o el texto actual si quieres mostrarlo
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