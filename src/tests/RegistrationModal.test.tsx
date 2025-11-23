import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegistrationModal from '../components/RegistrationModal';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

const renderModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onShowLogin: jest.fn(),
    featureName: 'Test Feature',
  };

  return render(
    <LanguageProvider>
      <ThemeProvider>
        <RegistrationModal {...defaultProps} {...props} />
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('RegistrationModal Component', () => {
  it('renders when isOpen is true', () => {
    renderModal();
    expect(screen.getByText(/Función Bloqueada/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = renderModal({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('displays feature name', () => {
    renderModal({ featureName: 'Clasificación' });
    expect(screen.getByText(/Clasificación/i)).toBeInTheDocument();
  });

  it('calls onShowLogin when login button is clicked', () => {
    const onShowLogin = jest.fn();
    const onClose = jest.fn();
    renderModal({ onShowLogin, onClose });
    
    const loginButton = screen.getByText(/Iniciar Sesión \/ Registrarse/i);
    fireEvent.click(loginButton);
    
    expect(onClose).toHaveBeenCalled();
    expect(onShowLogin).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    
    const cancelButton = screen.getByText(/Continuar sin registrarse/i);
    fireEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('displays benefits list', () => {
    renderModal();
    expect(screen.getByText(/Beneficios de registrarte/i)).toBeInTheDocument();
  });
});
