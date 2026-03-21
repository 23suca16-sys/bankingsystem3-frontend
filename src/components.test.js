import { render } from '@testing-library/react';
import App from './App';

test('app renders without crashing', () => {
  render(<App />);
});

test('multiple renders', () => {
  render(<App />);
  render(<App />);
});

test('basic truth test', () => {
  expect(true).toBe(true);
});
