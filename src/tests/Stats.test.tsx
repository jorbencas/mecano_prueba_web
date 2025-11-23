import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Stats from '../components/Stats';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        {component}
      </LanguageProvider>
    </ThemeProvider>
  );
};

const mockStats = {
  wpm: 60,
  accuracy: 95,
  level: 1,
  errors: 2,
  elapsedTime: 60,
  levelCompleted: true,
  wpmGoal: 50,
  errorLimit: 5,
  levelData: {
    wpmGoal: 50,
    errorLimit: 5,
  },
};

describe('Stats Component', () => {
  test('renders Stats component', () => {
    renderWithProviders(
      <Stats
        stats={mockStats}
        onRepeatLevel={jest.fn()}
        onNextLevel={jest.fn()}
        sourceComponent="Levels"
      />
    );
    expect(screen.getByText(/Nivel Completado/i)).toBeInTheDocument();
  });

  test('displays correct stats', () => {
    renderWithProviders(
      <Stats
        stats={mockStats}
        onRepeatLevel={jest.fn()}
        onNextLevel={jest.fn()}
        sourceComponent="Levels"
      />
    );
    expect(screen.getByText('60')).toBeInTheDocument(); // WPM
    expect(screen.getByText('95%')).toBeInTheDocument(); // Accuracy
  });

  test('shows next level button when level completed', () => {
    renderWithProviders(
      <Stats
        stats={mockStats}
        onRepeatLevel={jest.fn()}
        onNextLevel={jest.fn()}
        sourceComponent="Levels"
      />
    );
    expect(screen.getByText(/Siguiente Nivel/i)).toBeInTheDocument();
  });

  test('shows repeat level button', () => {
    renderWithProviders(
      <Stats
        stats={mockStats}
        onRepeatLevel={jest.fn()}
        onNextLevel={jest.fn()}
        sourceComponent="Levels"
      />
    );
    expect(screen.getByText(/Repetir Nivel/i)).toBeInTheDocument();
  });

  test('calls onNextLevel when button clicked', () => {
    const handleNextLevel = jest.fn();
    renderWithProviders(
      <Stats
        stats={mockStats}
        onRepeatLevel={jest.fn()}
        onNextLevel={handleNextLevel}
        sourceComponent="Levels"
      />
    );
    fireEvent.click(screen.getByText(/Siguiente Nivel/i));
    expect(handleNextLevel).toHaveBeenCalled();
  });
});
