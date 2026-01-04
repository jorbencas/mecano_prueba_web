import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LevelCreator from '../components/LevelCreator';
import { ThemeProvider } from '@hooks/useTheme';
import { LanguageProvider } from '@hooks/useLanguage';

import { AuthProvider } from '../context/AuthContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('LevelCreator Component', () => {
  test('renders LevelCreator component', () => {
    renderWithProviders(<LevelCreator />);
    expect(screen.getByRole('heading', { name: /Creador de Niveles/i })).toBeInTheDocument();
  });

  test('allows entering level name', () => {
    renderWithProviders(<LevelCreator />);
    const nameInput = screen.getByPlaceholderText(/Mi Nivel Personalizado/i);
    fireEvent.change(nameInput, { target: { value: 'Test Level' } });
    expect(nameInput).toHaveValue('Test Level');
  });

  test('allows setting goals', () => {
    renderWithProviders(<LevelCreator />);
    const wpmInput = screen.getByLabelText(/Objetivo WPM/i);
    const errorInput = screen.getByLabelText(/Límite de Errores/i);
    
    fireEvent.change(wpmInput, { target: { value: '50' } });
    fireEvent.change(errorInput, { target: { value: '10' } });
    
    expect(wpmInput).toHaveValue(50);
    expect(errorInput).toHaveValue(10);
  });

  test('allows selecting keys', () => {
    renderWithProviders(<LevelCreator />);
    const keyA = screen.getByText('a');
    fireEvent.click(keyA);
    expect(keyA).toHaveClass('bg-blue-500');
    expect(screen.getByText(/Este nivel practicará las teclas/i)).toBeInTheDocument();
  });

  test('saves level when save button is clicked', () => {
    window.alert = jest.fn();
    renderWithProviders(<LevelCreator />);
    
    // Select a key first to enable save button
    fireEvent.click(screen.getByText('a'));
    
    const saveButton = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(saveButton);
    
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Nivel guardado correctamente'));
  });
});
