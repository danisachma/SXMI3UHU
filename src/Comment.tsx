import React from 'react';

interface CommentProps {
  author: string;
  text: string;
}

const Comment: React.FC<CommentProps> = ({ author, text }) => {
  return (
    <li className="comment-box">
      <strong>{author}:</strong> {text}
    </li>
  );
};

export default Comment;
