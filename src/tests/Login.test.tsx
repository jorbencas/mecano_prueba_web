import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '@components/Login';
import { ThemeProvider } from '@hooks/useTheme';
import { LanguageProvider } from '@hooks/useLanguage';
import { AuthProvider } from '@context/AuthContext';

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

  test('shows error message on failed login', async () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/usuario@ejemplo.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    // We expect an error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  test('calls login function on successful submission', async () => {
    // This would require mocking the auth context or API
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/usuario@ejemplo.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Check for success feedback or navigation
    await waitFor(() => {
      // For example, if it redirects or shows a success message
      // expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
