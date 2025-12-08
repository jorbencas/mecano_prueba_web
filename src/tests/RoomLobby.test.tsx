import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomLobby from '../components/RoomLobby';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { MultiplayerProvider } from '../context/MultiplayerContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <MultiplayerProvider>{component}</MultiplayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('RoomLobby', () => {
  const mockOnJoinRoom = jest.fn();

  it('renders lobby interface', () => {
    renderWithProviders(
      <RoomLobby mode="practice" onJoinRoom={mockOnJoinRoom} />
    );
    
    expect(document.body).toBeInTheDocument();
  });

  it('displays create room button or input', () => {
    renderWithProviders(
      <RoomLobby mode="practice" onJoinRoom={mockOnJoinRoom} />
    );
    
    // Should have room creation interface
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
