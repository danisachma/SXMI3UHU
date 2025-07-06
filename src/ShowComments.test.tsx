import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShowComments from './ShowComments';

const mockComments = [
	{ id: 1, author: 'Alice', text: 'Great project!' },
	{ id: 2, author: 'Bob', text: 'Looking forward to more features.' },
];

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

	expect(screen.getByText('Charlie:')).toBeInTheDocument();
	expect(screen.getByText('This is a new comment.')).toBeInTheDocument();
});

test('allows a comment to be deleted after confirming', async () => {
	render(<ShowComments comments={mockComments} />);
	jest.spyOn(window, 'confirm').mockImplementation(() => true);

	const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
	expect(deleteButtons.length).toBeGreaterThan(0);

	await userEvent.click(deleteButtons[0]);

	expect(screen.queryByText('Alice:')).not.toBeInTheDocument();

	(window.confirm as jest.Mock).mockRestore();
});

test('does not delete a comment if deletion is not confirmed', async () => {
	render(<ShowComments comments={mockComments} />);
	jest.spyOn(window, 'confirm').mockImplementation(() => false);

	const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
	expect(deleteButtons.length).toBeGreaterThan(0);

	await userEvent.click(deleteButtons[0]);

	expect(screen.getByText('Alice:')).toBeInTheDocument();

	(window.confirm as jest.Mock).mockRestore();
});
