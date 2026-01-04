import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Stats from '../components/Stats';
import { ThemeProvider } from '@hooks/useTheme';
import { LanguageProvider } from '@hooks/useLanguage';
import { AccessibilityProvider } from '@hooks/useAccessibility';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <AccessibilityProvider>
        <ThemeProvider>
          {component}
        </ThemeProvider>
      </AccessibilityProvider>
    </LanguageProvider>
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

const mockErrorList = [
  { expected: 'a', actual: 's' },
  { expected: 'd', actual: 'f' },
];

describe('Stats Component', () => {
  test('renders Stats component', () => {
    renderWithProviders(
      <Stats
        stats={mockStats}
        errorList={mockErrorList}
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
        errorList={mockErrorList}
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
        errorList={mockErrorList}
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
        errorList={mockErrorList}
        onRepeatLevel={jest.fn()}
        onNextLevel={jest.fn()}
        sourceComponent="Levels"
      />
    );
    expect(screen.getByText(/Repetir Nivel/i)).toBeInTheDocument();
  });

  test('displays error list correctly', () => {
    renderWithProviders(
      <Stats
        stats={mockStats}
        errorList={mockErrorList}
        onRepeatLevel={jest.fn()}
        onNextLevel={jest.fn()}
        sourceComponent="Levels"
      />
    );
    expect(screen.getByText(/Lista de Errores/i)).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('s')).toBeInTheDocument();
  });

  test('calls onRepeatLevel when button clicked', () => {
    const handleRepeatLevel = jest.fn();
    renderWithProviders(
      <Stats
        stats={mockStats}
        errorList={mockErrorList}
        onRepeatLevel={handleRepeatLevel}
        onNextLevel={jest.fn()}
        sourceComponent="Levels"
      />
    );
    fireEvent.click(screen.getByText(/Repetir Nivel/i));
    expect(handleRepeatLevel).toHaveBeenCalled();
  });

  test('renders correctly for FreePractice source', () => {
    renderWithProviders(
      <Stats
        stats={mockStats}
        errorList={mockErrorList}
        onRepeatLevel={jest.fn()}
        onNextLevel={jest.fn()}
        sourceComponent="FreePractice"
      />
    );
    expect(screen.getByText(/Sesión Finalizada/i)).toBeInTheDocument();
    expect(screen.queryByText(/Siguiente Nivel/i)).not.toBeInTheDocument();
  });
});
