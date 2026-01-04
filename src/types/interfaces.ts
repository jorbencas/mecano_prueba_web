import { GameSource } from './enums';

export interface InstruccionesButtonProps {
  instructions?: string;
  source?: GameSource;
  showKeyboardShortcuts?: boolean;
}

export interface TypingAreaProps {
  text: string;
  currentIndex: number; 
  onKeyPress?: (key: string) => void;
  wpm?: number;
  accuracy?: number;
  errors?: { [key: number]: { expected: string; actual: string } } | number;
  source?: GameSource;
  standalone?: boolean; // If true, only show text without stats
  maxHeight?: string; // Optional max height for scrollable text
  completedClass?: string; // Custom class for completed text
  activeClass?: string; // Custom class for the current character
}
