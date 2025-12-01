import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuLevels from '../components/MenuLevels';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

const mockLevels = [
  { name: 'Level 1', text: 'test text 1' },
  { name: 'Level 2', text: 'test text 2' },
  { name: 'Level 3', text: 'test text 3' },
];

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThemeProvider>
);

// Mock useDynamicTranslations
jest.mock('../hooks/useDynamicTranslations', () => ({
  useDynamicTranslations: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
    language: 'es',
    changeLanguage: jest.fn(),
  }),
}));

describe('MenuLevels Component', () => {
  it('renders level list correctly', () => {
    const mockOnLevelChange = jest.fn();
    
    render(
      <Wrapper>
        <MenuLevels
          source="Levels"
          onLevelChange={mockOnLevelChange}
          currentLevel={0}
          levels={mockLevels}
        />
      </Wrapper>
    );

    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
  });

  it('calls onLevelChange when level is clicked', () => {
    const mockOnLevelChange = jest.fn();
    
    render(
      <Wrapper>
        <MenuLevels
          source="Levels"
          onLevelChange={mockOnLevelChange}
          currentLevel={0}
          levels={mockLevels}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByText('Level 1'));
    expect(mockOnLevelChange).toHaveBeenCalledWith(0);
  });

  it('shows lock icon for locked levels when not authenticated', () => {
    const mockOnLevelChange = jest.fn();
    const lockedLevels = Array.from({ length: 15 }, (_, i) => ({
      name: `Level ${i + 1}`,
      text: `text ${i + 1}`
    }));
    
    render(
      <Wrapper>
        <MenuLevels
          source="Levels"
          onLevelChange={mockOnLevelChange}
          currentLevel={0}
          levels={lockedLevels}
        />
      </Wrapper>
    );

    // Levels 11+ should show unlock requirement text or lock icon
    // Note: The exact text might vary based on translation, but we look for the lock logic
    // In the component: {isLocked && <FaLock ... />}
    // We can check if the 11th element has opacity-50 class which indicates locked state
    const items = screen.getAllByRole('listitem');
    expect(items[10]).toHaveClass('opacity-50');
  });

  it('highlights current level', () => {
    const mockOnLevelChange = jest.fn();
    
    render(
      <Wrapper>
        <MenuLevels
          source="Levels"
          onLevelChange={mockOnLevelChange}
          currentLevel={1}
          levels={mockLevels}
        />
      </Wrapper>
    );

    const level2 = screen.getByText('Level 2').closest('li');
    expect(level2).toHaveClass('bg-blue-500');
  });
});
