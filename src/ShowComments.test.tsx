import React from 'react';
import { render, screen } from '@testing-library/react';
import ShowComments from './ShowComments';

const mockComments = [
  { id: 1, author: 'Alice', text: 'Great project!' },
  { id: 2, author: 'Bob', text: 'Looking forward to more features.' }
];

test('renders the list of comments', () => {
  render(<ShowComments comments={mockComments} />);
  const list = screen.getByRole('list');
  expect(list).toBeInTheDocument();
});
