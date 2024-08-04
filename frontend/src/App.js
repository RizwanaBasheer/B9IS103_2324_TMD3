import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import ChatApp from './components/ChatApp';
import './App.css'


function App() {
  
  return (
    <Router>
    {/* <div className="container-fluid"> */}
    <Routes>
      {!sessionStorage.getItem("token") ? <Route path="/" element={<Home />} /> : <Route path="/" element={<ChatApp/>} />}
    </Routes>
    {/* </div> */}

  </Router>
  );
}

export default App;
