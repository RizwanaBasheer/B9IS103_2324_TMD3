import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import ChatApp from './components/ChatApp';
import './App.css'

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatApp />} />
        </Routes>
    </Router>
  );
}

export default App;
