import React, { useState, useEffect } from 'react';
import Comment from './Comment';
import { getAllComments, saveAllComments, deleteCommentFromDB } from './db';

interface CommentType {
  id: number;
  author: string;
  text: string;
  replies?: { author: string; text: string }[];
}

interface ShowCommentsProps {
  comments: CommentType[];
}

const ShowComments: React.FC<ShowCommentsProps> = ({ comments }) => {
  const [commentList, setCommentList] = useState<CommentType[]>(comments);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    getAllComments().then(dbComments => {
      if (dbComments.length > 0) setCommentList(dbComments);
    });
  }, []);

  useEffect(() => {
    saveAllComments(commentList);
  }, [commentList]);

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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;
    const newComment = {
      id: Date.now(),
      author,
      text
    };
    setCommentList([...commentList, newComment]);
    setAuthor('');
    setText('');
  };

  const handleDeleteComment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setCommentList(commentList.filter(c => c.id !== id));
      deleteCommentFromDB(id);
    }
  };

  const handleReplyToComment = (id: number, reply: { author: string; text: string }) => {
    setCommentList(commentList.map(comment =>
      comment.id === id
        ? { ...comment, replies: [...(comment.replies || []), reply] }
        : comment
    ));
  };

  const handleDeleteReply = (commentId: number, replyIdx: number) => {
    setCommentList((commentList: CommentType[]) =>
      commentList.map((comment: CommentType) => {
        if (comment.id !== commentId) return comment;
        const newReplies = (comment.replies || []).filter((_, idx: number) => idx !== replyIdx);
        return { ...comment, replies: newReplies };
      })
    );
  };

  return (
    <div>
      <h1>Comments</h1>
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
            onReply={reply => handleReplyToComment(comment.id, reply)}
            replies={comment.replies || []}
            onDeleteReply={(replyIdx: number) => handleDeleteReply(comment.id, replyIdx)}
          />
        ))}
      </ul>
    </div>
  );
};

export default ShowComments;
