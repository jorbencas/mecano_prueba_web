import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../components/Settings';
import { ThemeProvider } from '@hooks/useTheme';
import { LanguageProvider } from '@hooks/useLanguage';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '@hooks/useAccessibility';

const renderSettings = () => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AccessibilityProvider>
            <Settings />
          </AccessibilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('Settings Component', () => {
  it('renders settings title', () => {
    renderSettings();
    expect(screen.getByText(/Configuración/i)).toBeInTheDocument();
  });

  it('toggles theme', () => {
    renderSettings();
    const darkButton = screen.getByText(/Oscuro/i);
    fireEvent.click(darkButton);
  });

  it('changes language', () => {
    renderSettings();
    const enButton = screen.getByText(/English/i);
    fireEvent.click(enButton);
  });

  it('toggles accessibility options', () => {
    renderSettings();
    const dyslexiaToggle = screen.getByLabelText(/Fuente para dislexia/i);
    fireEvent.click(dyslexiaToggle);
    expect(dyslexiaToggle).toBeChecked();
  });
});
