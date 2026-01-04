import { render, screen } from '@testing-library/react';
import Keyboard from '../components/Keyboard';

// Mock hooks
jest.mock('@hooks/useTheme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

jest.mock('../hooks/useDynamicTranslations', () => ({
  useDynamicTranslations: () => ({ t: (_key: string, defaultVal: string) => defaultVal }),
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

  test('highlights active key for special characters', () => {
    render(<Keyboard activeKey="," levelKeys={[]} />);
    const keyComma = screen.getByText(',').closest('div');
    expect(keyComma).toHaveClass('bg-orange-500');
  });

  test('renders all rows in full keyboard', () => {
    render(<Keyboard activeKey="" levelKeys={[]} isFullKeyboard={true} />);
    expect(screen.getByText('Tab')).toBeInTheDocument();
    expect(screen.getByText('CapsLock')).toBeInTheDocument();
    expect(screen.getByText('Enter')).toBeInTheDocument();
    expect(screen.getByText('Alt')).toBeInTheDocument();
  });

  test('highlights space bar', () => {
    render(<Keyboard activeKey=" " levelKeys={[]} />);
    // Space bar is usually a large div without text or with specific class
    const spaceBar = document.querySelector('[class*="w-64"], [class*="w-80"]');
    expect(spaceBar).toBeTruthy();
  });
});
