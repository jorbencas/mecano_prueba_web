import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@hooks/useTheme';
import { LanguageProvider } from '@hooks/useLanguage';
import { AuthProvider } from '@context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock ThemeContext to avoid matchMedia issues
jest.mock('@hooks/useTheme', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({ isDarkMode: false, toggleTheme: jest.fn() }),
}));

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

export * from '@testing-library/react';
export { renderWithProviders };
