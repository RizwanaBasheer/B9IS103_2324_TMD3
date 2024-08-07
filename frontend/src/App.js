import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import ChatApp from './components/ChatApp';
import './App.css';
import { OnlineUsersProvider } from './context/OnlineUsersContext';

function App() {
  return (
    <OnlineUsersProvider>
      <Router>
        <Routes>
          {!sessionStorage.getItem("token") 
            ? <Route path="/" element={<Home />} /> 
            : <Route path="/" element={<ChatApp />} />}
        </Routes>
      </Router>
    </OnlineUsersProvider>
  );
}

export default App;
