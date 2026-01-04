import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FollowButton from '../components/social/FollowButton';
import { socialAPI } from '../api/social';

// Mock socialAPI
jest.mock('../api/social');

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
  </>
);

// Mock useAuth
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
}));

describe('FollowButton Component', () => {
  const mockToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('auth_token', 'fake-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders correctly when not following', () => {
    render(
      <Wrapper>
        <FollowButton 
          targetUserId="target-123" 
          initialIsFollowing={false}
          onToggle={mockToggle}
        />
      </Wrapper>
    );

    expect(screen.getByText('Seguir')).toBeInTheDocument();
  });

  it('renders correctly when following', () => {
    render(
      <Wrapper>
        <FollowButton 
          targetUserId="target-123" 
          initialIsFollowing={true}
          onToggle={mockToggle}
        />
      </Wrapper>
    );

    expect(screen.getByText('Siguiendo')).toBeInTheDocument();
  });

  it('calls API and toggles state on click', async () => {
    (socialAPI.followUser as jest.Mock).mockResolvedValue({});

    render(
      <Wrapper>
        <FollowButton 
          targetUserId="target-123" 
          initialIsFollowing={false}
          onToggle={mockToggle}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByText('Seguir'));

    await waitFor(() => {
      expect(socialAPI.followUser).toHaveBeenCalled();
      expect(mockToggle).toHaveBeenCalledWith(true);
    });
  });
});
