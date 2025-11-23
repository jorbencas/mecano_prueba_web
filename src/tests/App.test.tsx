import App from '../App';
import { renderWithProviders, screen } from './test-utils';

test('renders learn react link', () => {
  renderWithProviders(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
