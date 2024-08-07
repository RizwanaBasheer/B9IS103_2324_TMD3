import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import ChatApp from './components/ChatApp';
import './App.css';
import { OnlineUsersProvider } from './context/OnlineUsersContext';
const apiUrl = process.env.REACT_APP_API_BASE_URL;

function App() {
  return (
    <OnlineUsersProvider apiUrl={apiUrl}>
      <Router>
        <Routes>
          {!sessionStorage.getItem("token") 
            ? <Route path="/" element={<Home apiUrl={apiUrl}/>} /> 
            : <Route path="/" element={<ChatApp apiUrl={apiUrl}/>} />}
        </Routes>
      </Router>
    </OnlineUsersProvider>
  );
}

export default App;
