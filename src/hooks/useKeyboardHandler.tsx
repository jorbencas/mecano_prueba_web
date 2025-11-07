// hooks/useKeyboardHandler.ts
import { useEffect } from 'react';

export function useKeyboardHandler(callback: (key: string) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => callback(event.key);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}
