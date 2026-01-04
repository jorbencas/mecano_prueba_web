import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedDropdown from '../components/EnhancedDropdown';
import { ThemeProvider } from '@hooks/useTheme';

const mockOptions = [
  { value: 1, label: 'Option 1' },
  { value: 2, label: 'Option 2' },
  { value: 3, label: 'Option 3' },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('EnhancedDropdown', () => {
  it('renders with placeholder', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <EnhancedDropdown
        options={mockOptions}
        value={1}
        onChange={onChange}
        placeholder="Select option"
      />
    );
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <EnhancedDropdown
        options={mockOptions}
        value={1}
        onChange={onChange}
      />
    );
    
    const trigger = screen.getByText('Option 1');
    fireEvent.click(trigger);
    
    // All options should be visible
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <EnhancedDropdown
        options={mockOptions}
        value={1}
        onChange={onChange}
      />
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Option 1'));
    
    // Click option 2
    fireEvent.click(screen.getByText('Option 2'));
    
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('filters options when searchable', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <EnhancedDropdown
        options={mockOptions}
        value={1}
        onChange={onChange}
        searchable={true}
      />
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Option 1'));
    
    // Search input should be present
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
    
    // Type to filter
    fireEvent.change(searchInput, { target: { value: '2' } });
    
    // Only Option 2 should be visible
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <EnhancedDropdown
        options={mockOptions}
        value={1}
        onChange={onChange}
      />
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Option 1'));
    
    // Simulate arrow down
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    
    // Simulate enter
    fireEvent.keyDown(document, { key: 'Enter' });
    
    // Should have selected next option
    expect(onChange).toHaveBeenCalled();
  });
});
