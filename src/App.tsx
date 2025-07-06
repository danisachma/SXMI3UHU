import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import ShowComments from './ShowComments';


function App() {

  return (
    <div className="App">
      <header className="App-header">
        <h1>Comments</h1>
      </header>
      <main className="App-body">
        <ShowComments comments={[]} />
      </main>
    </div>
  );
}

export default App;
