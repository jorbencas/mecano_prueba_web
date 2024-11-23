import React, { useState, useEffect } from 'react';
import TypingArea from './TypingArea';
import Hands from './Hands';
import ErrorModal from './ErrorModal';
import Keyboard from './Keyboard'; // Asegúrate de tener este componente
import Stats from './Stats'; // Importar el componente Stats

const CreateText: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [texts, setTexts] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextKey, setNextKey] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState<{ [key: number]: { expected: string; actual: string } }>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCreateTextModal, setShowCreateTextModal] = useState(false); // Para mostrar el modal de crear texto
  const [newText, setNewText] = useState('');
  const [showStatsModal, setShowStatsModal] = useState(false); // Modal para mostrar estadísticas
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);
  const [errorList, setErrorList] = useState<{ expected: string; actual: string }[]>([]);

  // Cargar textos guardados desde localStorage al iniciar
  useEffect(() => {
    const storedTexts = localStorage.getItem('texts');
    if (storedTexts) {
      setTexts(JSON.parse(storedTexts));
    }
  }, []);

  // Guardar textos en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('texts', JSON.stringify(texts));
  }, [texts]);

  // Manejar la entrada del teclado
  const handleKeyPress = (key: string) => {
    if (!selectedText) return;

    const expectedKey = selectedText[currentIndex].toLowerCase();

    if (key.toLowerCase() === expectedKey) {
      // Si la tecla es correcta
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (newIndex < selectedText.length) {
        // Actualizar la siguiente tecla esperada
        setNextKey(selectedText[newIndex].toLowerCase());
      } else {
        // Fin del texto
        setNextKey('');
        finishInput();
      }
    } else {
      // Manejo de errores si la tecla es incorrecta
      setErrors(prev => ({
        ...prev,
        [currentIndex]: { expected: expectedKey, actual: key },
      }));
    }
    updateAccuracy();
  };

   // Actualizar precisión basada en errores cometidos
   const updateAccuracy = () => {
     const errorCount = Object.keys(errors).length;
     setAccuracy(currentIndex > 0 ? Math.round(((currentIndex - errorCount) / currentIndex) * 100) : 100);
   };

   // Finalizar la entrada y mostrar estadísticas
   const finishInput = () => {
     console.log("Texto completado. Errores:", errors);

     let errorDetails = Object.entries(errors).map(([index, error]) => (
       { expected: error.expected, actual: error.actual }
     ));

     // Calcular WPM
     const totalWords = selectedText.split(' ').length;
     const timeTakenInSeconds = (currentIndex / selectedText.length) * totalWords; // Estimación simple de tiempo
     const calculatedWPM = Math.round((totalWords / timeTakenInSeconds) || 0);

     // Mostrar modal con resultados al finalizar el texto
     setWpm(calculatedWPM);
     setErrorList(errorDetails);
     
     resetInput(); // Reiniciar todo para permitir un nuevo intento.
     
     if (errorDetails.length > 0) {
       setErrorMessage(`Se encontraron ${errorDetails.length} errores.`);
     } else {
       setErrorMessage('Todo ha salido bien. ¡Buen trabajo!');
     }

     setShowStatsModal(true); 
   };

   // Reiniciar la entrada
   const resetInput = () => {
     setSelectedText('');
     setCurrentIndex(0);
     setErrors({});
     setNextKey('');
   };

   // Función para agregar un nuevo texto
   const handleAddNewText = () => {
     if (newText.trim()) {
       setTexts(prev => [...prev, newText.trim()]); // Agregar nuevo texto a la lista
       setNewText(''); // Limpiar el campo de entrada
       setShowCreateTextModal(false); // Cerrar el modal de creación de texto
     } else {
       setErrorMessage('Por favor, ingresa un texto válido.');
       setShowErrorModal(true);
     }
   };

   return (
     <div className="container mx-auto p-4 flex">
       <div className="w-1/4 pr-4">
         <h2 className="text-2xl font-bold mb-2">Textos Escrito</h2>
         <ul className="space-y-2">
           {texts.map((text, index) => (
             <li key={index} className="p-2 border rounded bg-gray-100 cursor-pointer" onClick={() => {
               setSelectedText(text);
               setNextKey(text[0].toLowerCase());
               setCurrentIndex(0);
               setErrors({});
             }}>
               {text}
             </li>
           ))}
         </ul>
         <button 
           onClick={() => setShowCreateTextModal(true)} 
           className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
         >
           Crear Nuevo Texto
         </button>
       </div>

       <div className="w-3/4">
         <h1 className="text-3xl font-bold mb-4">Escribe el Texto Seleccionado</h1>

         {/* Mostrar el área de escritura */}
         <TypingArea 
           text={selectedText} 
           currentIndex={currentIndex} 
           onKeyPress={handleKeyPress} 
           wpm={wpm} 
           accuracy={accuracy} 
           errors={errors} 
         />

         {/* Mostrar teclado */}
         <Keyboard activeKey={nextKey} levelKeys={[]} /> {/* Pasar un arreglo vacío ya que no hay niveles */}

         {/* Mostrar las manos */}
         <Hands nextKey={nextKey} />

         {/* Botón para volver al menú principal */}
         <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
           Volver al Menú Principal
         </button>

         {/* Modal para mostrar estadísticas al finalizar el texto */}
         {showStatsModal && (
           <ErrorModal isOpen={showStatsModal} onClose={() =>setShowStatsModal(false)}>
             <Stats 
               wpm={wpm}
               accuracy={accuracy}
               level={1} // No hay niveles en este contexto.
               errors={Object.keys(errors).length}
               wpmGoal={0} // No hay objetivo en este caso.
               elapsedTime={null} // Puedes calcular o dejar como null si no es necesario.
               errorList={errorList}
               levelCompleted={true} // Siempre completado ya que no hay niveles.
               errorLimit={0} // No hay límite de errores.
               onRepeatLevel={() => {setShowStatsModal(false)}} // Placeholder ya que no hay niveles.
               onNextLevel={() => {}}   // Placeholder ya que no hay niveles.
               sourceComponent={"CreateText"} // Pasar nombre del componente que llama a Stats.
             />
           </ErrorModal>
         )}

         {/* Modal para crear nuevo texto */}
         {showCreateTextModal && (
           <ErrorModal isOpen={showCreateTextModal} onClose={() =>setShowCreateTextModal(false)}>
             <div className="p-4">
               <h2 className= "text-xl font-bold mb=2">Crear Nuevo Texto</h2>
               <input 
                 type= "text"
                 value= {newText}
                 onChange={(e) =>setNewText(e.target.value)}
                 placeholder= "Escribe un nuevo texto aquí..."
                 className= "border p-2 rounded mb-2 w-full"
               />
               <button onClick={handleAddNewText} className= "mt-4 px-4 py-2 bg-green-500 text-white rounded">Agregar Nuevo Texto</button>  
               <button onClick={() =>setShowCreateTextModal(false)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Cerrar</button>  
             </div>  
           </ErrorModal>  
         )}
       </div>  
     </div>  
   );  
};  

export default CreateText;  