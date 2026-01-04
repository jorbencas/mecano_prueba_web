import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityChart from '../components/ActivityChart';
import { ThemeProvider } from '@hooks/useTheme';

const mockData = [
  { component: 'FreePractice', count: 50, time: 3000 },
  { component: 'SpeedMode', count: 30, time: 1800 },
  { component: 'PlayGame', count: 20, time: 1200 },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ActivityChart', () => {
  it('renders chart with title', () => {
    renderWithTheme(
      <ActivityChart data={mockData} title="Test Chart" />
    );
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('displays all data items', () => {
    renderWithTheme(
      <ActivityChart data={mockData} title="Test Chart" />
    );
    
    expect(screen.getByText('FreePractice')).toBeInTheDocument();
    expect(screen.getByText('SpeedMode')).toBeInTheDocument();
    expect(screen.getByText('PlayGame')).toBeInTheDocument();
  });

  it('shows activity counts', () => {
    renderWithTheme(
      <ActivityChart data={mockData} title="Test Chart" />
    );
    
    expect(screen.getByText('50 actividades')).toBeInTheDocument();
    expect(screen.getByText('30 actividades')).toBeInTheDocument();
    expect(screen.getByText('20 actividades')).toBeInTheDocument();
  });

  it('displays time in minutes and seconds', () => {
    renderWithTheme(
      <ActivityChart data={mockData} title="Test Chart" />
    );
    
    // 3000 seconds = 50m 0s
    expect(screen.getByText(/50m 0s/)).toBeInTheDocument();
  });

  it('shows message when no data', () => {
    renderWithTheme(
      <ActivityChart data={[]} title="Empty Chart" />
    );
    
    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });
});
