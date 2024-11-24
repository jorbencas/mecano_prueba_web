import React, { useState, useEffect } from 'react';
import Menu from './components/Menu'; // Asegúrate de importar tu nuevo componente Menu
import Levels from './components/Levels'; // Asegúrate de importar tu nuevo componente Levels
import CreateText from './components/CreateText'; // Importar el nuevo componente para crear texto
import PlayGame from './components/PlayGame'; // Importar el nuevo componente para jugar

const App: React.FC = () => {
  const [text, setText] = useState(''); // Texto inicial para mecanografía
  const [currentIndex, setCurrentIndex] = useState(0); // Índice actual del carácter
  const [wpm, setWpm] = useState(0); // Palabras por minuto
  const [accuracy, setAccuracy] = useState(100); // Precisión
  const [errors, setErrors] = useState<{ [key: number]: { expected: string; actual: string } }>({}); // Errores cometidos
  const [isMenuVisible, setIsMenuVisible] = useState(true); // Estado para controlar el menú
  const [isLevelsVisible, setIsLevelsVisible] = useState(false); // Estado para controlar la vista de niveles
  const [isCreateTextVisible, setIsCreateTextVisible] = useState(false); // Estado para controlar la vista de crear texto
  const [isPlayGameVisible, setIsPlayGameVisible] = useState(false); // Estado para controlar la vista del juego

  // Lista de textos predefinidos para practicar
  const predefinedTexts = [
    "La práctica hace al maestro.",
    "El rápido zorro marrón salta sobre el perro perezoso.",
    "Un buen comienzo es la mitad de la batalla.",
    "La tecnología avanza a pasos agigantados.",
    "Cada día es una nueva oportunidad para aprender."
  ];

  // Generar texto al cargar
  useEffect(() => {
    generateText(); // Llama a la función para establecer un texto inicial al cargar
  }, []);

  const generateText = () => {
    const randomIndex = Math.floor(Math.random() * predefinedTexts.length);
    setText(predefinedTexts[randomIndex]);
    setCurrentIndex(0); // Reiniciar el índice actual al inicio del texto
    setErrors({}); // Reiniciar los errores al generar un nuevo texto
  };

  const handleKeyPress = (key: string) => {
    if (currentIndex < text.length) {
      const expectedChar = text[currentIndex]; // Obtener el carácter esperado

      if (key.toLowerCase() === expectedChar.toLowerCase()) {
        setCurrentIndex(currentIndex + 1); // Incrementar si la tecla es correcta
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          [currentIndex]: { expected: expectedChar, actual: key }, // Registrar error
        }));
      }
    }
  };

  const handleLevelPractice = () => {
    console.log("Practicar por niveles"); 
    setIsMenuVisible(false); 
    setIsLevelsVisible(true); 
    generateText(); // Generar un nuevo texto al iniciar niveles.
  };

  const handleCreateText = () => {
    console.log("Crear tu propio texto");
    setIsMenuVisible(false);
    setIsCreateTextVisible(true); 
    generateText(); 
   };

   const handlePlayGame = () => {
     console.log("Jugar");
     setIsMenuVisible(false);
     setIsPlayGameVisible(true);
   };

   return (
     <div>
       {isMenuVisible && !isLevelsVisible && !isCreateTextVisible && !isPlayGameVisible ? (
         <Menu 
           onLevelPractice={handleLevelPractice}
           onCreateText={handleCreateText}
           onPlayGame={handlePlayGame}
         />
       ) : isLevelsVisible ? (
         <Levels onBack={() => {setIsLevelsVisible(false); setIsMenuVisible(true);}} />
       ) : isCreateTextVisible ? (
         <CreateText 
           onBack={() => {setIsCreateTextVisible(false); setIsMenuVisible(true);}} 
         />
       ) : isPlayGameVisible ? (
         <PlayGame 
           onBack={() => {setIsPlayGameVisible(false); setIsMenuVisible(true);}} 
         />
       ) : (
         <>
          
           
         </>
       )}
     </div>
   );
};

export default App;