  import React, { useState, useEffect } from 'react';
  import Keyboard from './Keyboard';
  import TypingArea from './TypingArea';
  import Stats from './Stats';
  import Hands from './Hands';
  import ErrorModal from './ErrorModal';

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
    const [level, setLevel] = useState(1);
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
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Generar texto al cambiar de nivel
    useEffect(() => {
      generateText();
    }, [level]);

    // Función para generar texto aleatorio basado en las teclas del nivel actual
      const generateText = () => {
          const currentLevel = levels[level - 1];
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
        const levelCompleted = currentWpm >= levels[level -1].wpmGoal && accuracy >=95;
        setLevelCompleted(levelCompleted);
        if (levelCompleted && !completedLevels.includes(level)) {
          setCompletedLevels(prev => [...prev, level]);
        }
        // Mostrar modal de estadísticas
        setShowStatsModal(true);
      }
    };

    // Manejar la entrada del teclado
    const handleKeyPress =(key:string) => {
      if (!text) return;
      if (currentIndex ===0 && startTime === null) {
        // Iniciar temporizador al primer carácter escrito
        setStartTime(Date.now());
      }
      // Contar pulsaciones de teclas
      setTotalKeystrokes(prev => prev +1);

      // Obtener la tecla esperada del texto actual
      const expectedKey = text[currentIndex].toLowerCase();
      if (key.toLowerCase() === expectedKey) {
        // Si la tecla es correcta
        const newIndex = currentIndex +1;
        setCurrentIndex(newIndex);
        if (newIndex < text.length) {
          // Actualizar la siguiente tecla esperada
          setNextKey(text[newIndex].toLowerCase());
        } else {
          // Fin del texto
          setNextKey('');
          finishLevel();
        }
        updateWPM();
      } else {
        // Manejo de errores si la tecla es incorrecta
        setErrors(prev => {
          const newErrors ={ ...prev, [currentIndex]: { expected: expectedKey, actual: key } };
          if (Object.keys(newErrors).length >= levels[level -1].errorLimit) {
            // Mostrar mensaje de error si se alcanza el límite
            setErrorMessage(`Has alcanzado el límite de ${levels[level -1].errorLimit} errores. ¡Inténtalo de nuevo!`);
            setShowErrorModal(true);
          }
          return newErrors;
        });
        
        // Guardar los últimos errores con información adicional
        if (errorList.length <5) {
          // Guardar el último error con la letra esperada y la letra escrita
          setErrorList(prev => [{ expected: expectedKey, actual: key }, ...prev]);
        } else {
          // Mantener solo los últimos cinco errores
          setErrorList(prev => [{ expected: expectedKey, actual: key }, ...prev.slice(0,4)]);
        }
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

      // Regresar al nivel anterior si no es el primer nivel.
      const goBackLevel = () => {
        if (level > 1) {
          setLevel(level - 1); 
        }
      };

    // Cerrar modal de error y reiniciar texto al hacer clic fuera o presionar Escape.
    const closeErrorModal= () => {
      // Cerrar modal de error y reiniciar texto.
      setShowErrorModal(false);
      generateText();
    };

    return (
      <div className="container mx-auto p-4 flex">
        <div className="w-1/4 pr-4">
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-2">Niveles</h2>
            <ul className="space-y-2">
              {levels.map((lvl,index) => (
                <li key={index} className={`p-2 rounded cursor-pointer ${index +1 === level ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() =>setLevel(index +1)}>
                  {lvl.name}
                </li>
              ))}
            </ul>
            {/* Botón para regresar al menú principal */}
            <button 
              onClick={onBack} 
              className="mt-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-600"
            >
              Regresar al Menú Principal
            </button>
          </div>
        </div>
        <div className="w-3/4">
          <h1 className="text-3xl font-bold mb-4">Práctica de Mecanografía</h1>
          <TypingArea
            text={text}
            currentIndex={currentIndex}
            onKeyPress={handleKeyPress}
            wpm={wpm}
            accuracy={accuracy}
            errors={errors}
          />
          <Keyboard activeKey={nextKey} levelKeys={levels[level -1].keys} />
          <Hands nextKey={nextKey} />
          {/* Modal para mostrar estadísticas */}
          <ErrorModal isOpen={showStatsModal} onClose={() =>setShowStatsModal(false)}>
            {/* Componente Stats */}
            <Stats 
              wpm={wpm}
              accuracy={accuracy}
              level={level}
              errors={Object.keys(errors).length}
              wpmGoal={levels[level -1].wpmGoal}
              elapsedTime={elapsedTime}
              errorList={errorList}
              levelCompleted={levelCompleted}
              errorLimit={levels[level -1].errorLimit}
              onRepeatLevel={repeatLevel} 
              onNextLevel={nextLevel} 
              sourceComponent={"Levels"} // Indicar que proviene de Levels
            />
          </ErrorModal>
          {/* Modal para mostrar el límite de errores alcanzado */}
          <ErrorModal isOpen={showErrorModal} onClose={closeErrorModal}>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">Límite de Errores Alcanzado</h2>
              <p>{errorMessage}</p>
              {/* Botón para reintentar el nivel */}
              <button onClick={closeErrorModal} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Reintentar Nivel
              </button>
            </div>
          </ErrorModal>
        </div>
      </div>
    );
  };

  export default Levels;