import App from '@/App';
import { renderWithProviders } from './test-utils';

test('renders app without crashing', () => {
  renderWithProviders(<App />);
});
