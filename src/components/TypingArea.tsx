import React, { useEffect, useRef } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useDynamicTranslations } from '@/hooks/useDynamicTranslations';
import { GameSource } from '@/types/enums';
import { TypingAreaProps } from '@/types/interfaces';

const TypingArea: React.FC<TypingAreaProps> = ({ 
  text, 
  currentIndex, 
  onKeyPress, 
  wpm = 0, 
  accuracy = 100, 
  errors = 0, 
  source,
  standalone = false,
  maxHeight,
}) => {
  const textAreaRef = useRef<HTMLParagraphElement>(null);
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  useEffect(() => {
    if (!onKeyPress) return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      onKeyPress(event.key);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onKeyPress]);

  useEffect(() => {
    if (source === GameSource.CREATE_TEXT && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [text, source]);

  const errorCount = typeof errors === 'object' ? Object.keys(errors).length : errors;

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className={`mb-4 ${maxHeight ? maxHeight : source === GameSource.CREATE_TEXT ? 'max-h-60 overflow-y-auto' : ''}`}>
        <p
          ref={textAreaRef}
          className={`text-lg font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:text-xl lg:text-2xl border-2 border-gray-300 rounded-lg p-4 mb-4 
            min-h-[6rem] h-auto whitespace-pre-wrap break-all`}
        >
          {text.split('').map((char, index) => (
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

      {!standalone && (
        <div className={`flex flex-col sm:flex-row justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <p className="inline-block mr-0 sm:mr-4 text-lg">
            {t('typingArea.stats.wpm')}: {wpm}
          </p>
          <p className="inline-block mr-0 sm:mr-4 text-lg">
            {t('typingArea.stats.accuracy')}: {accuracy}%
          </p>
          <p className="inline-block text-lg">
            {t('typingArea.stats.errors')}: {errorCount}
          </p>
        </div>
      )}
    </div>
  );
};

export default TypingArea;