import React from 'react';
import { render, screen } from '@testing-library/react';
import Keyboard from '../components/Keyboard';

// Mock hooks
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('../hooks/useDynamicTranslations', () => ({
  useDynamicTranslations: () => ({ t: (key: string, defaultVal: string) => defaultVal }),
}));

describe('Keyboard Component', () => {
  test('renders simple keyboard by default', () => {
    render(<Keyboard activeKey="" levelKeys={[]} />);
    expect(screen.getByText('q')).toBeInTheDocument();
    expect(screen.queryByText('Shift')).not.toBeInTheDocument();
  });

  test('renders full keyboard when isFullKeyboard is true', () => {
    render(<Keyboard activeKey="" levelKeys={[]} isFullKeyboard={true} />);
    expect(screen.getByText('Shift')).toBeInTheDocument();
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  test('highlights active key', () => {
    render(<Keyboard activeKey="a" levelKeys={[]} />);
    const keyA = screen.getByText('a').closest('div');
    expect(keyA).toHaveClass('bg-orange-500');
  });

  test('highlights level keys', () => {
    render(<Keyboard activeKey="" levelKeys={['s', 'd']} />);
    const keyS = screen.getByText('s').closest('div');
    const keyD = screen.getByText('d').closest('div');
    expect(keyS).toHaveClass('bg-orange-200');
    expect(keyD).toHaveClass('bg-orange-200');
  });

  test('handles shift combination', () => {
    render(<Keyboard activeKey="A" levelKeys={[]} isFullKeyboard={true} />);
    // "A" implies Shift + a
    const keyShift = screen.getAllByText('Shift')[0].closest('div');
    const keyA = screen.getByText('a').closest('div');
    
    expect(keyShift).toHaveClass('bg-orange-500');
    expect(keyA).toHaveClass('bg-orange-500');
  });
});
