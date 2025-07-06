import React, { useState, useEffect } from 'react';
import Comment from './Comment';
import { getAllComments, deleteCommentFromDB, addCommentToDB, updateCommentInDB } from './db';

interface CommentType {
  id: number;
  author: string;
  text: string;
  replies?: { author: string; text: string }[];
}

interface ShowCommentsProps {
  comments: CommentType[];
}

const COMMENT_RATE_LIMIT = 5; // max 5 comments
const COMMENT_RATE_WINDOW_MS = 60 * 1000; // per minute
const REPLY_RATE_LIMIT = 5; // max 5 replies
const REPLY_RATE_WINDOW_MS = 60 * 1000; // per minute

function isValidUsername(name: string) {
  return !!name && !/\s/.test(name);
}

function sanitizeInput(str: string, maxLength: number = 300) {
  // Remove control characters except newlines, trim, and limit length
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, maxLength);
}

const ShowComments: React.FC<ShowCommentsProps> = ({ comments }) => {
  const [commentList, setCommentList] = useState<CommentType[]>(comments);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [commentTimestamps, setCommentTimestamps] = useState<number[]>([]);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [replyTimestamps, setReplyTimestamps] = useState<number[]>([]);

  useEffect(() => {
    getAllComments().then(dbComments => {
      if (dbComments.length > 0) setCommentList(dbComments);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getAllComments().then(dbComments => {
        // Compare not only by id/length, but also by replies content
        const isDifferent =
          dbComments.length !== commentList.length ||
          dbComments.some((c, i) => {
            const current = commentList[i];
            if (!current || c.id !== current.id) return true;
            const cReplies = c.replies || [];
            const currentReplies = current.replies || [];
            if (cReplies.length !== currentReplies.length) return true;
            return cReplies.some((r: { author: string; text: string }, idx: number) =>
              r.author !== currentReplies[idx]?.author || r.text !== currentReplies[idx]?.text
            );
          });
        if (isDifferent) {
          setCommentList(dbComments);
        }
      });
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [commentList]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    // Remove timestamps older than 1 minute
    const recentTimestamps = commentTimestamps.filter(ts => now - ts < COMMENT_RATE_WINDOW_MS);
    if (recentTimestamps.length >= COMMENT_RATE_LIMIT) {
      setRateLimitError('You can only add 5 comments per minute. Please wait.');
      return;
    }
    setRateLimitError(null);
    if (!author || !text) return;
    if (!isValidUsername(author)) {
      setRateLimitError('Usernames cannot contain spaces.');
      return;
    }
    const sanitizedAuthor = sanitizeInput(author, 40);
    const sanitizedText = sanitizeInput(text, 300);
    const newComment = {
      id: now,
      author: sanitizedAuthor,
      text: sanitizedText
    };
    setCommentList([...commentList, newComment]);
    setCommentTimestamps([...recentTimestamps, now]);
    setAuthor('');
    setText('');
    await addCommentToDB(newComment);
  };

  const handleDeleteComment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setCommentList(commentList.filter(c => c.id !== id));
      deleteCommentFromDB(id);
    }
  };

  const handleReplyToComment = async (id: number, reply: { author: string; text: string }, setReplyError: (msg: string | null) => void) => {
    const now = Date.now();
    const recentReplyTimestamps = replyTimestamps.filter(ts => now - ts < REPLY_RATE_WINDOW_MS);
    if (recentReplyTimestamps.length >= REPLY_RATE_LIMIT) {
      setReplyError('You can only add 5 replies per minute. Please wait.');
      return false;
    }
    setReplyError(null);
    if (!reply.author || !reply.text) {
      setReplyError('Invalid reply.');
      return false;
    }
    if (!isValidUsername(reply.author)) {
      setReplyError('Usernames cannot contain spaces.');
      return false;
    }
    const sanitizedAuthor = sanitizeInput(reply.author, 40);
    const sanitizedText = sanitizeInput(reply.text, 300);
    const updatedList = commentList.map(comment =>
      comment.id === id
        ? { ...comment, replies: [...(comment.replies || []), { author: sanitizedAuthor, text: sanitizedText }] }
        : comment
    );
    setCommentList(updatedList);
    setReplyTimestamps([...recentReplyTimestamps, now]);
    // Update only the changed comment in the DB
    const updatedComment = updatedList.find(c => c.id === id);
    if (updatedComment) {
      await updateCommentInDB(updatedComment);
    }
    return true;
  };

  const handleDeleteReply = async (commentId: number, replyIdx: number) => {
    const updatedList = commentList.map((comment: CommentType) => {
      if (comment.id !== commentId) return comment;
      const newReplies = (comment.replies || []).filter((_, idx: number) => idx !== replyIdx);
      return { ...comment, replies: newReplies };
    });
    setCommentList(updatedList);
    // Update only the changed comment in the DB
    const updatedComment = updatedList.find(c => c.id === commentId);
    if (updatedComment) {
      await updateCommentInDB(updatedComment);
    }
  };

  return (
    <div>
      <h1>Comments</h1>
      {rateLimitError && <div className="rate-limit-error" style={{ color: 'red', marginBottom: 8 }}>{rateLimitError}</div>}
      <form onSubmit={handleAddComment} className="comment-form">
        <input
          type="text"
          placeholder="Your name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          required
        />
        <textarea
          placeholder="Your comment"
          value={text}
          onChange={e => setText(e.target.value)}
          required
        />
        <button type="submit">Add Comment</button>
      </form>
      <ul className="comments-list">
        {commentList.map((comment: CommentType) => (
          <Comment
            key={comment.id}
            author={comment.author}
            text={comment.text}
            onDelete={() => handleDeleteComment(comment.id)}
            onReply={(reply, setReplyError) => handleReplyToComment(comment.id, reply, setReplyError)}
            replies={comment.replies || []}
            onDeleteReply={(replyIdx: number) => handleDeleteReply(comment.id, replyIdx)}
          />
        ))}
      </ul>
    </div>
  );
};

export default ShowComments;
