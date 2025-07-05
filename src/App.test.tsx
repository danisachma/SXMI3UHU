import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders comments page', () => {
  render(<App />);
  const linkElement = screen.getByText(/Comments/i);
  expect(linkElement).toBeInTheDocument();
});
