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

test('shows the correct author name for each comment', () => {
  render(<ShowComments comments={mockComments} />);
  mockComments.forEach(comment => {
    const authorElement = screen.getByText(new RegExp(`^${comment.author}:`));
    expect(authorElement).toBeInTheDocument();
  });
});

test('displays the author name exactly as written', () => {
  render(<ShowComments comments={mockComments} />);
  expect(screen.getByText('Alice:')).toBeInTheDocument();
  expect(screen.getByText('Bob:')).toBeInTheDocument();
});

test('displays the comment text exactly as it is', () => {
  render(<ShowComments comments={mockComments} />);
  expect(screen.getByText('Great project!')).toBeInTheDocument();
  expect(screen.getByText('Looking forward to more features.')).toBeInTheDocument();
});

test('shows the correct number of comments', () => {
  render(<ShowComments comments={mockComments} />);
  const commentItems = screen.getAllByRole('listitem');
  expect(commentItems).toHaveLength(mockComments.length);
});
