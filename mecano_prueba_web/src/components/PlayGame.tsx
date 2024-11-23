import React, { useState, useEffect } from 'react';
import Keyboard from './Keyboard';
import TypingArea from './TypingArea';
import Stats from './Stats';
import Hands from './Hands';
import ErrorModal from './ErrorModal';

const levels = [
  { keys: ['j', 'f', ' '], name: "Nivel 1: Posición base y espacio", text: "jf fj jf fj jjff ffjj fjfj jffj", wpmGoal: 15, errorLimit: 5 },
  { keys: ['j', 'f', 'k', 'd'], name: "Nivel 2: Introducción a las letras", text: "jfkd fjkd dkjf kfjf", wpmGoal: 20, errorLimit: 4 },
  // Agrega más niveles según sea necesario
];

const PlayGame: React.FC<{onBack: () => void}> = ({ onBack }) =>  {
  const [level, setLevel] = useState(1);
  const [text, setText] = useState('');
  const [nextKey, setNextKey] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState<{ [key: number]: { expected: string; actual: string } }>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [errorList, setErrorList] = useState<{ expected: string; actual: string }[]>([]);
  
  // Total de palabras calculadas
  const totalWords = text.split(' ').length;

  // Generar texto al cambiar de nivel
  useEffect(() => {
    generateText();
  }, [level]);

  // Función para generar texto aleatorio basado en las teclas del nivel actual
  const generateText = () => {
    const currentLevel = levels[level - 1];
    let newText = generateRandomText(currentLevel.keys, 50); // Generar un texto aleatorio
    setText(newText);
    setNextKey(newText[0].toLowerCase());
    setCurrentIndex(0);
    setErrors({});
    setWpm(0);
    setAccuracy(100);
    setErrorList([]);
    setStartTime(null); // Reiniciar el temporizador
  };

  // Función para generar texto aleatorio
  const generateRandomText = (keys: string[], length: number): string => {
    return Array.from({ length }, () => keys[Math.floor(Math.random() * keys.length)]).join('');
  };

  // Manejar la entrada del teclado
  const handleKeyPress = (key: string) => {
    if (!text) return;

    if (currentIndex === 0 && startTime === null) {
      // Iniciar temporizador al primer carácter escrito
      setStartTime(Date.now());
    }

    // Obtener la tecla esperada del texto actual
    const expectedKey = text[currentIndex].toLowerCase();

    if (key.toLowerCase() === expectedKey) {
      // Si la tecla es correcta
      const newIndex = currentIndex + 1;
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
      setErrors(prev => ({
        ...prev,
        [currentIndex]: { expected: expectedKey, actual: key },
      }));
      // Guardar los últimos errores con información adicional
      if (errorList.length < levels[level - 1].errorLimit) {
        // Guardar el último error con la letra esperada y la letra escrita
        setErrorList(prev => [{ expected: expectedKey, actual: key }, ...prev]);
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
     setAccuracy(totalWords >0 ? Math.round(((totalWords - errorCount) / totalWords) *100) :100 );
   };

   // Finalizar nivel y mostrar estadísticas
   const finishLevel = () => {
     if (startTime !== null) {
       const elapsedMinutes =(Date.now() - startTime) / (1000 *60 );
       const wordsTyped= currentIndex / totalWords;
       const currentWpm= Math.round(wordsTyped / elapsedMinutes);

       // Mostrar modal de estadísticas
       setShowStatsModal(true);

       // Aquí puedes calcular WPM y otras estadísticas si es necesario

       // Almacenar la lista de errores para mostrar en el modal
       setErrorList(Object.entries(errors).map(([index, error]) => ({
         expected: error.expected,
         actual: error.actual,
       })));
     }
   };

   // Reiniciar el juego
   const resetGame = () => {
     generateText();
     // Reiniciar modal de estadísticas si es necesario
     setShowStatsModal(false);
   };

   return (
     <div className="container mx-auto p-4 flex">
       <div className="w-1/4 pr-4">
         <h2 className="text-2xl font-bold mb-2">Niveles</h2>
         <ul className="space-y-2">
           {levels.map((lvl, index) => (
             <li key={index} className={`p-2 rounded cursor-pointer ${index + 1 === level ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setLevel(index + 1)}>
               {lvl.name}
             </li>
           ))}
         </ul>
       </div>

       <div className="w-3/4">
         <h1 className="text-3xl font-bold mb-4">Práctica de Mecanografía</h1>
         <TypingArea text={text} currentIndex={currentIndex} onKeyPress={handleKeyPress} wpm={wpm} accuracy={accuracy} errors={errors} />
         <Keyboard activeKey={nextKey} levelKeys={levels[level - 1].keys} />
         <Hands nextKey={nextKey} />
 {/* Botón para volver al menú principal */}
         <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
           Volver al Menú Principal
         </button>

         {/* Modal para mostrar estadísticas */}
         {showStatsModal && (
           <ErrorModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)}>
             <Stats 
               wpm={wpm}
               accuracy={accuracy}
               level={level}
               errors={Object.keys(errors).length}
               wpmGoal={levels[level - 1].wpmGoal}
               elapsedTime={null} // Puedes calcular o dejar como null si no es necesario.
               errorList={errorList}
               levelCompleted={true} // Siempre completado ya que no hay niveles.
               errorLimit={levels[level - 1].errorLimit}
               onRepeatLevel={() => resetGame()} // Función para reiniciar el juego.
               onNextLevel={() => console.log("No hay siguiente nivel")} // Placeholder ya que no hay niveles.
               sourceComponent={"PlayGame"} // Indicar que proviene de PlayGame.
             />
             {/* Botón para cerrar el modal */}
             <button onClick={() => setShowStatsModal(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Cerrar</button>
           </ErrorModal>
         )}
       </div>
     </div>
   );
};

export default PlayGame;