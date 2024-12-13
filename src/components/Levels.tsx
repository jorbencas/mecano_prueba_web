  import React, { useState, useEffect } from 'react';
  import Keyboard from './Keyboard';
  import TypingArea from './TypingArea';
  import Stats from './Stats';
  import Hands from './Hands';
  import ErrorModal from './ErrorModal';
  import MenuLevels from "./MenuLevels";
  import { useTheme } from '../context/ThemeContext';

  interface LevelsProps {
    onBack: () => void; // Función para volver al menú principal
  }

  const levels = [
    { keys: ['j', 'f', ' '], name: "Nivel 1: Posición base y espacio", text: "jf fj jf fj jjff ffjj fjfj jffj", wpmGoal: 15, errorLimit: 5 },
    { keys: ['j', 'f', 'k', 'd'], name: "Nivel 2: Introducción a las letras", text: "jfkd fjkd dkjf kfjf", wpmGoal: 20, errorLimit: 4 },
    { keys: ['j', 'f', 'k', 'd', ' '], name: "Nivel 3: Índices y espacio", text: "jfkd fkdj jfd kfdj", wpmGoal: 25, errorLimit: 4 },
    { keys: ['j', 'f', 'k', 'd', 'l', 's'], name: "Nivel 4: Añadiendo anulares", text: "jfkdls ldkfj sldkfj", wpmGoal: 30, errorLimit: 3 },
    { keys: ['j', 'f', 'k', 'd', 'l', 's', 'a'], name: "Nivel 5: Introducción a las letras adicionales", text:"jfkdlsa sldkfja", wpmGoal :35, errorLimit :3 },
    { keys:['j','f','k','d','l','s','a','ñ'], name :"Nivel 6: Meñiques", text :"añsl fkjd ñalk jfds lasñ kfdj", wpmGoal :40, errorLimit :3 },
    { keys:['q','w','e','r','t','y','u','i','o','p'], name :"Nivel 7: Introducción a las letras superiores", text :"qw er ty uiop", wpmGoal :45, errorLimit :2 },
    { keys:['a','s','d','f','g','h','j','k','l'], name :"Nivel 8: Letras inferiores", text :"asdfgh jkl", wpmGoal :55, errorLimit :2 },
    { keys:['z','x','c','v','b','n','m'], name :"Nivel 9: Combinaciones avanzadas", text :"zxcvbnm", wpmGoal :65, errorLimit :2 },
    { keys:['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], name :"Nivel 10: Práctica completa con números y letras", text :"Practicar mecanografía mejora la velocidad y precisión.", wpmGoal :75, errorLimit :1 }
  ];

  const Levels: React.FC<LevelsProps> = ({ onBack }) => {
    const [level, setLevel] = useState(0);
    const [text, setText] = useState('');
    const [nextKey, setNextKey] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [errors, setErrors] = useState<{ [key: number]: { expected: string; actual: string } }>({});
    const [startTime, setStartTime] = useState<number | null>(null);
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [levelCompleted, setLevelCompleted] = useState(false);
    const [totalWords, setTotalWords] = useState(0);
    const [elapsedTime, setElapsedTime] = useState<number | null>(null);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [completedLevels, setCompletedLevels] = useState<number[]>([]);
    const [errorList, setErrorList] = useState<{ expected: string; actual: string }[]>([]);
      const { isDarkMode } = useTheme();

    // Generar texto al cambiar de nivel
    useEffect(() => {
      generateText();
    }, [level]);

    // Función para generar texto aleatorio basado en las teclas del nivel actual
      const generateText = () => {
          const currentLevel = levels[level];
          let newText = generateRandomText(currentLevel.keys, 50);
          setText(newText);
          setNextKey(newText[0].toLowerCase());
          setCurrentIndex(0); // Asegúrate de que el índice actual sea cero al iniciar
          setTotalWords(newText.split(' ').length);
          setStartTime(null);
          setWpm(0);
          setAccuracy(100);
          setErrors({});
          setTotalKeystrokes(0);
          setLevelCompleted(false);
          setElapsedTime(null);
          setErrorList([]);
      };

    // Función para generar texto aleatorio
    const generateRandomText = (keys:string[], length:number): string => {
      return Array.from({ length }, () => keys[Math.floor(Math.random() * keys.length)]).join('');
    };

    // Finalizar nivel y mostrar estadísticas
    const finishLevel = () => {
      if (startTime !== null) {
        const elapsedMinutes =(Date.now() - startTime) / (1000 *60 );
        const wordsTyped = currentIndex / totalWords;
        const currentWpm = Math.round(wordsTyped / elapsedMinutes);
        const timeTaken = Math.round((Date.now() - startTime) /1000 );
        setElapsedTime(timeTaken);
        const levelCompleted = currentWpm >= levels[level].wpmGoal && accuracy >=95;
        setLevelCompleted(levelCompleted);
        if (levelCompleted && !completedLevels.includes(level)) {
          setCompletedLevels(prev => [...prev, level]);
        }
        // Mostrar modal de estadísticas
        setShowStatsModal(true);
      }
    };

    // Manejar la entrada del teclado
   const handleKeyPress = (key: string) => {
  if (!text) return;
  
  if (currentIndex === 0 && startTime === null) {
    setStartTime(Date.now());
  }
  
  setTotalKeystrokes(prev => prev + 1);
  
  const expectedKey = text[currentIndex].toLowerCase();
  
  if (key.toLowerCase() === expectedKey) {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    
    if (newIndex < text.length) {
      setNextKey(text[newIndex].toLowerCase());
    } else {
      setNextKey('');
      finishLevel();
    }
    
    updateWPM();
  } else {
    setErrors(prev => {
      const newErrors = { 
        ...prev, 
        [currentIndex]: { 
          expected: expectedKey, 
          actual: key 
        } 
      };
      
      if (Object.keys(newErrors).length >= levels[level].errorLimit) {
        finishLevel();
      }
      
      return newErrors;
    });
    
    // Guardar todos los errores con información adicional
    setErrorList(prev => [{ expected: expectedKey, actual: key }, ...prev]);
  }
  
  updateAccuracy();
};

    // Actualizar WPM basado en el tiempo transcurrido y palabras escritas
    const updateWPM = () => {
      if (startTime) {
        const elapsedMinutes =(Date.now() - startTime) / (1000 *60 );
        const wordsTyped= currentIndex / totalWords;
        const currentWpm= Math.round(wordsTyped / elapsedMinutes);
        setWpm(currentWpm);
      }
    };

    // Actualizar precisión basada en errores cometidos
    const updateAccuracy= () => {
      const errorCount= Object.keys(errors).length;
      // Calcular precisión
      setAccuracy( totalKeystrokes >0 ? Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) *100) :100 );
    };

    // Repetir nivel actual reiniciando el texto y estadísticas
    const repeatLevel= () => {
      generateText();
      // Reiniciar modal de estadísticas
      setShowStatsModal(false);
    };

    // Avanzar al siguiente nivel si se ha completado exitosamente
    const nextLevel= () => {
      if (level < levels.length && levelCompleted) {
        // Avanzar al siguiente nivel
        setLevel(level +1 );
        // Reiniciar modal de estadísticas
        setShowStatsModal(false);
      } else {
        console.log("No se puede avanzar al siguiente nivel. Completa el nivel actual.");
      }
    };

    return (
 <div className={`container mx-auto p-4 flex flex-col lg:flex-row ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>      <MenuLevels 
        source="Levels" 
        onBack={onBack} // Llama a la función para volver al menú
        onLevelChange={(newLevel) => setLevel(newLevel)} 
        currentLevel={level}
        levels={levels}
      />
      
      
        <div className="w-full lg:w-3/4">
         <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Práctica de Mecanografía</h1>
          <TypingArea
            text={text}
            currentIndex={currentIndex}
            onKeyPress={handleKeyPress}
            wpm={wpm}
            accuracy={accuracy}
            errors={errors}
            source="Levels"
          />
          <Keyboard activeKey={nextKey} levelKeys={levels[level].keys} />
          <Hands nextKey={nextKey} />
          {/* Modal para mostrar estadísticas */}
          <ErrorModal isOpen={showStatsModal} onClose={() =>setShowStatsModal(false)}>
            {/* Componente Stats */}
            <Stats 
              wpm={wpm}
              accuracy={accuracy}
              level={level}
              errors={Object.keys(errors).length}
              wpmGoal={levels[level].wpmGoal}
              elapsedTime={elapsedTime}
              errorList={errorList}
              levelCompleted={levelCompleted}
              errorLimit={levels[level].errorLimit}
              onRepeatLevel={repeatLevel} 
              onNextLevel={nextLevel} 
              sourceComponent={"Levels"} // Indicar que proviene de Levels
              text={text}
            />
          </ErrorModal>
        
        </div>
      </div>
    );
  };

  export default Levels;