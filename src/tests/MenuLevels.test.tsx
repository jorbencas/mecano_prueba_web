import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuLevels from '../components/MenuLevels';
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

const mockLevels = [
  { name: 'Level 1', wpmGoal: 20, errorLimit: 5 },
  { name: 'Level 2', wpmGoal: 30, errorLimit: 4 },
  { name: 'Level 11', wpmGoal: 100, errorLimit: 2 }, // Should be locked for unauth
];

describe('MenuLevels Component', () => {
  test('renders level list', () => {
    renderWithProviders(
      <MenuLevels
        source="Levels"
        onLevelChange={jest.fn()}
        currentLevel={0}
        levels={mockLevels}
      />
    );
    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
  });

  test('highlights current level', () => {
    renderWithProviders(
      <MenuLevels
        source="Levels"
        onLevelChange={jest.fn()}
        currentLevel={1}
        levels={mockLevels}
      />
    );
    const level2 = screen.getByText('Level 2').closest('li');
    expect(level2).toHaveClass('bg-blue-500');
  });

  test('calls onLevelChange when level clicked', () => {
    const handleLevelChange = jest.fn();
    renderWithProviders(
      <MenuLevels
        source="Levels"
        onLevelChange={handleLevelChange}
        currentLevel={0}
        levels={mockLevels}
      />
    );
    fireEvent.click(screen.getByText('Level 2'));
    expect(handleLevelChange).toHaveBeenCalledWith(1);
  });

  test('locks levels > 10 for unauthenticated users', () => {
    const manyLevels = Array(15).fill(null).map((_, i) => ({
      name: `Level ${i + 1}`,
      wpmGoal: 20,
      errorLimit: 5
    }));

    renderWithProviders(
      <MenuLevels
        source="Levels"
        onLevelChange={jest.fn()}
        currentLevel={0}
        levels={manyLevels}
        user={null} // Unauthenticated
      />
    );
    
    // Level 11 (index 10) should be locked
    const level11 = screen.getByText('Level 11').closest('li');
    expect(level11).toHaveClass('cursor-not-allowed');
    expect(screen.getAllByText('🔒').length).toBeGreaterThan(0);
  });
});
