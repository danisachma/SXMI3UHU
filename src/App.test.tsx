import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app page without crashing', () => {
  render(<App />);
});

test('displays content on the page', () => {
  render(<App />);
  // Check that at least one element is rendered
  const main = screen.getByRole('main');
  expect(main).toBeInTheDocument();
});
