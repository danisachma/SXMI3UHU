import React from 'react';
import { render, screen, act } from '@testing-library/react';

jest.mock('./db', () => ({
  getAllComments: jest.fn(() => Promise.resolve([])),
  saveAllComments: jest.fn(() => Promise.resolve()),
  deleteCommentFromDB: jest.fn(() => Promise.resolve()),
}));

import App from './App';

const { getAllComments } = require('./db');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
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

  it('shows new comments if another user adds them and the app polls for updates', async () => {
    // First call: initial comments
    getAllComments.mockResolvedValueOnce([
      { id: 1, author: 'Alice', text: 'Great project!' }
    ]);
    // Second call: new comment appears
    getAllComments.mockResolvedValueOnce([
      { id: 1, author: 'Alice', text: 'Great project!' },
      { id: 2, author: 'Eve', text: 'A new comment from another user.' }
    ]);
    render(<App />);
    expect(await screen.findByText('Alice:')).toBeInTheDocument();
    expect(screen.queryByText('Eve:')).not.toBeInTheDocument();

    // Simulate polling interval (e.g., 5 seconds)
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    // Wait for the new comment to appear
    expect(await screen.findByText('Eve:')).toBeInTheDocument();
    expect(screen.getByText('A new comment from another user.')).toBeInTheDocument();
  });
});
