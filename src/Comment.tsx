import React, { useState } from 'react';

interface CommentProps {
  author: string;
  text: string;
  onDelete?: () => void;
  onReply?: (reply: { author: string; text: string }, setReplyError: (msg: string | null) => void) => Promise<boolean>;
  onDeleteReply?: (replyIdx: number) => void;
  replies?: { author: string; text: string }[];
}

const Comment: React.FC<CommentProps> = ({ author, text, onDelete, onReply, onDeleteReply, replies = [] }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  const validateInput = (value: string, maxLength: number = 100) => {
    // Only allow printable characters, trim whitespace, and limit length
    const sanitized = value.replace(/[^\w\s.,!?@'"-]/g, '').trim();
    return sanitized.length > 0 && sanitized.length <= maxLength ? sanitized : '';
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const validAuthor = validateInput(replyAuthor, 40);
    const validText = validateInput(replyText, 300);
    if (!validAuthor || !validText) return;
    if (onReply) {
      const success = await onReply({ author: validAuthor, text: validText }, setReplyError);
      if (!success) return;
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
            onChange={e => setReplyAuthor(validateInput(e.target.value, 40))}
            required
          />
          <textarea
            placeholder="Your reply"
            value={replyText}
            onChange={e => setReplyText(validateInput(e.target.value, 300))}
            required
          />
          {replyError && <div className="rate-limit-error" style={{ color: 'red', marginBottom: 8 }}>{replyError}</div>}
          <button type="submit" disabled={!!replyError}>Add Reply</button>
        </form>
      )}
      {replies.length > 0 && (
        <ul className="replies-list">
          {replies.map((reply, idx) => (
            <li key={idx} className="reply-box">
              <strong>{reply.author}:</strong> {reply.text}
              {onDeleteReply && (
                <button
                  className="delete-comment-btn delete-reply-btn"
                  style={{ fontSize: '0.8em', padding: '2px 6px', marginLeft: '0.5em' }}
                  onClick={() => onDeleteReply(idx)}
                  type="button"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Comment;
