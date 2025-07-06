import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowComments from './ShowComments';

jest.mock('./db', () => ({
  getAllComments: jest.fn(() => Promise.resolve([])),
  addCommentToDB: jest.fn(() => Promise.resolve()),
  deleteCommentFromDB: jest.fn(() => Promise.resolve()),
  openDB: jest.fn(() => Promise.resolve({
    transaction: () => ({
      objectStore: () => ({
        put: jest.fn(),
      }),
    }),
  })),
  updateCommentInDB: jest.fn(() => Promise.resolve()),
}));

const mockComments = [
	{ id: 1, author: 'Alice', text: 'Great project!', replies: [] },
	{ id: 2, author: 'Bob', text: 'Looking forward to more features.', replies: [] },
];

beforeEach(() => {
  jest.clearAllMocks();
  const dbMock = require('./db');
  dbMock.getAllComments.mockImplementation(() => Promise.resolve([]));
  dbMock.openDB.mockImplementation(() => Promise.resolve({
    transaction: () => ({
      objectStore: () => ({
        put: jest.fn(),
      }),
    }),
  }));
});

test('renders the list of comments', () => {
	render(<ShowComments comments={mockComments} />);
	const list = screen.getByRole('list');
	expect(list).toBeInTheDocument();
});

test('shows the correct author name for each comment', () => {
	render(<ShowComments comments={mockComments} />);
	mockComments.forEach((comment) => {
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

test('allows a new comment to be added and displayed', async () => {
  render(<ShowComments comments={mockComments} />);
  const nameInput = screen.getByPlaceholderText('Your name');
  const commentTextarea = screen.getByPlaceholderText('Your comment');
  const submitButton = screen.getByRole('button', { name: /add comment/i });

  await userEvent.type(nameInput, 'Charlie');
  await userEvent.type(commentTextarea, 'This is a new comment.');
  await userEvent.click(submitButton);

  // Wait for the new comment to appear
  expect(await screen.findByText('Charlie:')).toBeInTheDocument();
  expect(await screen.findByText('This is a new comment.')).toBeInTheDocument();
});

test('allows a comment to be deleted after confirming', async () => {
  render(<ShowComments comments={mockComments} />);
  jest.spyOn(window, 'confirm').mockImplementation(() => true);

  const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
  expect(deleteButtons.length).toBeGreaterThan(0);

  await userEvent.click(deleteButtons[0]);

  // Wait for the comment to be removed
  expect(screen.queryByText('Alice:')).not.toBeInTheDocument();

  (window.confirm as jest.Mock).mockRestore();
});

test('does not delete a comment if deletion is not confirmed', async () => {
  render(<ShowComments comments={mockComments} />);
  jest.spyOn(window, 'confirm').mockImplementation(() => false);

  const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
  expect(deleteButtons.length).toBeGreaterThan(0);

  await userEvent.click(deleteButtons[0]);

  // Wait for the comment to still be present
  expect(await screen.findByText('Alice:')).toBeInTheDocument();

  (window.confirm as jest.Mock).mockRestore();
});

test('allows a user to write a reply to a comment', async () => {
  render(<ShowComments comments={mockComments} />);
  // Find the reply button for the first comment
  const replyButtons = screen.getAllByRole('button', { name: /reply/i });
  expect(replyButtons.length).toBeGreaterThan(0);
  await userEvent.click(replyButtons[0]);

  // Scope the reply inputs to the first comment's reply form
  const commentItems = screen.getAllByRole('listitem');
  const firstComment = commentItems[0];
  const replyNameInput = within(firstComment).getByPlaceholderText('Your name');
  const replyTextarea = within(firstComment).getByPlaceholderText('Your reply');
  const addReplyButton = screen.getByRole('button', { name: /add reply/i });

  await userEvent.type(replyNameInput, 'Dora');
  await userEvent.type(replyTextarea, 'This is a reply.');
  await userEvent.click(addReplyButton);

  // Wait for the reply to appear
  expect(await screen.findByText('Dora:')).toBeInTheDocument();
  expect(await screen.findByText('This is a reply.')).toBeInTheDocument();
});


