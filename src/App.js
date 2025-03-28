import React from 'react';
import './styles.css';
import Chat from './components/Chat';

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', color: 'hotpink' }}>Career Fairy</h1>
      <Chat />
    </div>
  );
}

export default App;