import React, { useState } from 'react';
import Comment from './Comment';

interface CommentType {
  id: number;
  author: string;
  text: string;
}

interface ShowCommentsProps {
  comments: CommentType[];
}

const ShowComments: React.FC<ShowCommentsProps> = ({ comments }) => {
  const [commentList, setCommentList] = useState<CommentType[]>(comments);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');

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
        {commentList.map(comment => (
          <Comment key={comment.id} author={comment.author} text={comment.text} />
        ))}
      </ul>
    </div>
  );
};

export default ShowComments;
