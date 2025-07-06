import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('./db', () => ({
  getAllComments: jest.fn(() => Promise.resolve([])),
  deleteCommentFromDB: jest.fn(() => Promise.resolve()),
}));

import App from './App';

const { getAllComments } = require('./db');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders comments from the db if present', async () => {
    getAllComments.mockResolvedValueOnce([
      { id: 1, author: 'Alice', text: 'Great project!' },
      { id: 2, author: 'Bob', text: 'Looking forward to more features.' },
    ]);
    render(<App />);
    expect(await screen.findByText('Alice:')).toBeInTheDocument();
    expect(screen.getByText('Great project!')).toBeInTheDocument();
    expect(screen.getByText('Bob:')).toBeInTheDocument();
    expect(screen.getByText('Looking forward to more features.')).toBeInTheDocument();
  });
});
