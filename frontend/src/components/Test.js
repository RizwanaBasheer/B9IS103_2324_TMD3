import React, { useState, useEffect } from 'react';
import randomColor from 'randomcolor';

function ChatArea({ selectedContact, isMobile, onBack }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [keyInput, setKeyInput] = useState(sessionStorage.getItem('Key') || '');

    const getRandomChatTheme = () => {
        const themes = ['#ff9a9e', '#fad0c4', '#fcb045', '#f6d365', '#fda085', '#f5a623'];
        return themes[Math.floor(Math.random() * themes.length)];
    };
    
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
            setTyping(true);
            setTimeout(() => {
                setMessages(prevMessages => [...prevMessages, { user: selectedContact.name, text: 'How are you?' }]);
                setTyping(false);
            }, 1000);
        }
    };
    
    const handleKeySubmit = () => {
        sessionStorage.setItem('Key', keyInput);
        setDropdownOpen(false);
    };
    
    
    if (!selectedContact) {
        return (
            <div className={`chat-area ${isMobile ? 'd-none' : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h6>Select a contact to start chatting</h6>
            </div>
        );
    }
    
    const chatThemeColor = getRandomChatTheme();
    
    return (
        <div className={`chat-area ${isMobile ? 'chat-area-mobile' : ''}`} style={{ flex: 1, height: '100vh', background: `linear-gradient(to bottom right, ${chatThemeColor}, #fff)` }}>
            {isMobile && (
                <div className="chat-header" style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white' }}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div className="avatar" style={{ backgroundColor: chatThemeColor, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '1rem' }}>
                        <span style={{ color: 'white', fontSize: '1.2rem' }}>{selectedContact.name[0]}</span>
                    </div>
                    <h6>{selectedContact.name}</h6>
                    <div style={{ marginLeft: 'auto' }}>
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ background: 'none', border: 'none', color: 'white' }}>
                            <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        {dropdownOpen && (
                            <div className="dropdown-menu show" style={{ padding: '1rem', position: 'absolute', top: '56px', right: '0', zIndex: '1000' }}>
                                <textarea
                                    placeholder="Enter a key"
                                    value={keyInput}
                                    onChange={(e) => setKeyInput(e.target.value)}
                                    style={{ width: '200px', marginBottom: '1rem' }}
                                />
                                <button className="btn btn-primary" onClick={handleKeySubmit}>Submit</button>
                                </div>
                        )}
                    </div>
           </div>
             {!isMobile && (
                <div className="chat-header bg-primary text-white p-3 d-flex align-items-center">
                    <div className="avatar me-2" style={{ backgroundColor: chatThemeColor, width: '40px', height: '40px', borderRadius: '50%' }}>
                        <span className="text-white d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%', fontSize: '1.2rem' }}>
                            {selectedContact.name[0]}
                        </span>
                    </div>
                    <h6 className="mb-0">{selectedContact.name}</h6>
                    <div className="ms-auto">
                        <button className="btn btn-link text-white" onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        {dropdownOpen && (
                            <div className="dropdown-menu show p-3" style={{ position: 'absolute', top: '56px', right: '0', zIndex: '1000' }}>
                                <textarea
                                    className="form-control mb-2"
                                    placeholder="Enter a key"
                                    value={keyInput}
                                    onChange={(e) => setKeyInput(e.target.value)}
                                    style={{ width: '200px' }}
                                />
                                <button className="btn btn-primary" onClick={handleKeySubmit}>Submit</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
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
                {typing && <div className="text-muted">Typing...</div>}
            </div>
            <div className={`chat-input p-3 border-top bg-light ${isMobile ? 'chat-input-mobile' : ''}`}>
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
