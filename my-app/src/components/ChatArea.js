import React, { useState, useEffect } from 'react';

function ChatArea({ selectedContact, onToggleSidebar }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (selectedContact) {
      setMessages([
        { user: selectedContact.name, text: 'Hello!' },
        { user: 'Me', text: 'Hi!' }
      ]);
    }
  }, [selectedContact]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { user: 'Me', text: message }]);
      setMessage('');
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { user: selectedContact.name, text: 'How are you?' }]);
      }, 1000);
    }
  };

  if (!selectedContact) {
    return (
      <div className="chat-area d-flex flex-column justify-content-center align-items-center" style={{ flex: 1, height: '100vh' }}>
        <h6>Select a contact to start chatting</h6>
      </div>
    );
  }

  return (
    <div className="chat-area d-flex flex-column" style={{ flex: 1, height: '100vh' }}>
      <div className="chat-header bg-primary text-white p-3 d-flex align-items-center">
        <button className="btn btn-link text-white d-md-none" onClick={onToggleSidebar}>
          <i className="material-icons">menu</i>
        </button>
        <img src={selectedContact.avatar} alt={selectedContact.name} className="rounded-circle me-2" style={{ width: '40px', height: '40px' }} />
        <h6 className="mb-0">{selectedContact.name}</h6>
      </div>
      <div className="chat-messages flex-fill p-3 overflow-auto" style={{ borderTop: '1px solid #ddd' }}>
        <ul className="list-unstyled">
          {messages.map((msg, index) => (
            <li key={index} className={`mb-2 ${msg.user === 'Me' ? 'text-end' : ''}`}>
              <div className={`d-inline-block p-2 rounded ${msg.user === 'Me' ? 'bg-primary text-white' : 'bg-light'}`}>
                {msg.text}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-input p-3 border-top bg-light">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="btn btn-primary" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;
