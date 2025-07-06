import React, { useState } from 'react';

interface CommentProps {
  author: string;
  text: string;
  onDelete?: () => void;
  onReply?: (reply: { author: string; text: string }) => void;
  replies?: { author: string; text: string }[];
}

const Comment: React.FC<CommentProps> = ({ author, text, onDelete, onReply, replies = [] }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyText, setReplyText] = useState('');

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyText.trim()) return;
    if (onReply) {
      onReply({ author: replyAuthor, text: replyText });
    }
    setReplyAuthor('');
    setReplyText('');
    setShowReply(false);
  };

  return (
    <li className="comment-box">
      <strong>{author}:</strong> {text}
      {onDelete && (
        <button className="delete-comment-btn" onClick={onDelete} type="button">Delete</button>
      )}
      {onReply && (
        <button className="reply-comment-btn" onClick={() => setShowReply(!showReply)} type="button">
          {showReply ? 'Cancel' : 'Reply'}
        </button>
      )}
      {showReply && (
        <form className="reply-form" onSubmit={handleReply} style={{ marginTop: '0.5em' }}>
          <input
            type="text"
            placeholder="Your name"
            value={replyAuthor}
            onChange={e => setReplyAuthor(e.target.value)}
            required
          />
          <textarea
            placeholder="Your reply"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            required
          />
          <button type="submit">Add Reply</button>
        </form>
      )}
      {replies.length > 0 && (
        <ul className="replies-list">
          {replies.map((reply, idx) => (
            <li key={idx} className="reply-box">
              <strong>{reply.author}:</strong> {reply.text}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Comment;
