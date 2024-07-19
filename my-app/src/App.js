import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from '@mui/material';
import Home from './components/Home';
import ChatApp from './components/ChatApp';

function App() {
  return (
    <Router>
      <Container fluid>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatApp />} />
        </Routes>
      </Container> 
    </Router>
  );
}

export default App;
