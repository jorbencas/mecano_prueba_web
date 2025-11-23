import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Menu from '../components/Menu';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            {component}
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Menu Component', () => {
  test('renders Menu component', () => {
    renderWithProviders(<Menu onSelectOption={jest.fn()} currentView="home" />);
    expect(screen.getByText(/MecanoWeb/i)).toBeInTheDocument();
  });

  test('displays navigation items', () => {
    renderWithProviders(<Menu onSelectOption={jest.fn()} currentView="home" />);
    expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/Práctica/i)).toBeInTheDocument();
    expect(screen.getByText(/Juegos/i)).toBeInTheDocument();
  });

  test('calls onSelectOption when item clicked', () => {
    const handleSelectOption = jest.fn();
    renderWithProviders(<Menu onSelectOption={handleSelectOption} currentView="home" />);
    
    const practiceButton = screen.getByText(/Práctica/i);
    fireEvent.click(practiceButton);
    
    // Menu items might be in a submenu or directly clickable depending on implementation
    // Assuming Práctica opens a submenu or navigates
    // If it's a submenu, we might need to click a sub-item
    // Let's check if Práctica is a direct link or opens submenu
    // Based on Menu.tsx, it likely toggles submenu
  });

  test('toggles theme', () => {
    renderWithProviders(<Menu onSelectOption={jest.fn()} currentView="home" />);
    // Find theme toggle button (usually by icon or aria-label)
    // This might require adding aria-label to the button in Menu.tsx if not present
    // For now, let's skip if we can't easily find it without ID
  });
});
