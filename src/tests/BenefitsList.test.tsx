import React from 'react';
import { render, screen } from '@testing-library/react';
import BenefitsList from '../components/BenefitsList';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

const renderBenefitsList = (props = {}) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <BenefitsList {...props} />
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('BenefitsList Component', () => {
  it('renders benefits title', () => {
    renderBenefitsList();
    expect(screen.getByText(/Beneficios de registrarte/i)).toBeInTheDocument();
  });

  it('renders all benefits', () => {
    renderBenefitsList();
    expect(screen.getByText(/Guarda tu progreso y estadísticas/i)).toBeInTheDocument();
    expect(screen.getByText(/Compite en la clasificación global/i)).toBeInTheDocument();
    expect(screen.getByText(/Desbloquea logros y medallas/i)).toBeInTheDocument();
    expect(screen.getByText(/Accede desde cualquier dispositivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Crea niveles y textos personalizados/i)).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    const { container } = renderBenefitsList({ compact: true });
    expect(container.querySelector('.text-sm')).toBeInTheDocument();
  });

  it('renders in normal mode by default', () => {
    const { container } = renderBenefitsList();
    expect(container.querySelector('.text-sm')).not.toBeInTheDocument();
  });
});
