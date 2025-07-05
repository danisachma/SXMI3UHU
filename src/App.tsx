import React from 'react';
import logo from './logo.svg';
import './App.css';
import ShowComments from './ShowComments';

function App() {
  const comments = [
    { id: 1, author: 'Alice', text: 'Great project!' },
    { id: 2, author: 'Bob', text: 'Looking forward to more features.' },
    { id: 3, author: 'Charlie', text: 'Nice UI!' }
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Comments</h1>
      </header>
      <main className="App-body">
        <ShowComments comments={comments} />
      </main>
    </div>
  );
}

export default App;
