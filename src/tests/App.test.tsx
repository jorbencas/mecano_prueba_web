import App from '../App';
import { renderWithProviders, screen } from './test-utils';

test('renders app without crashing', () => {
  renderWithProviders(<App />);
});
