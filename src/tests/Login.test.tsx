import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/Login';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
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

describe('Login Component', () => {
  test('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/usuario@ejemplo.com/i)).toBeInTheDocument();
  });

  test('can switch to register mode', () => {
    renderWithProviders(<Login />);
    const registerLink = screen.getByText(/¿No tienes cuenta\? Regístrate/i);
    fireEvent.click(registerLink);
    expect(screen.getByText(/Registrarse/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tu nombre/i)).toBeInTheDocument();
  });

  test('shows Google login button', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/Continuar con Google/i)).toBeInTheDocument();
  });

  test('validates email input', () => {
    renderWithProviders(<Login />);
    const emailInput = screen.getByPlaceholderText(/usuario@ejemplo.com/i) as HTMLInputElement;
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  test('validates password length', () => {
    renderWithProviders(<Login />);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('minLength', '6');
  });
});
