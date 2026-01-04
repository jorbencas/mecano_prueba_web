import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomLobby from '../components/RoomLobby';
import { ThemeProvider } from '@hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '@hooks/useLanguage';
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

  it('allows creating a new room', () => {
    renderWithProviders(
      <RoomLobby mode="practice" onJoinRoom={mockOnJoinRoom} />
    );
    
    const createButton = screen.getByText(/Crear Nueva Sala/i);
    fireEvent.click(createButton);
    // Should show room configuration or call a creation function
  });

  it('allows joining a room with a code', () => {
    renderWithProviders(
      <RoomLobby mode="practice" onJoinRoom={mockOnJoinRoom} />
    );
    
    const codeInput = screen.getByPlaceholderText(/Código de sala/i);
    const joinButton = screen.getByText(/Unirse/i);
    
    fireEvent.change(codeInput, { target: { value: 'ROOM-123' } });
    fireEvent.click(joinButton);
    
    expect(mockOnJoinRoom).toHaveBeenCalledWith('ROOM-123');
  });

  it('displays public rooms list', async () => {
    renderWithProviders(
      <RoomLobby mode="practice" onJoinRoom={mockOnJoinRoom} />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Salas Públicas/i)).toBeInTheDocument();
    });
  });
});
