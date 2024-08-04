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
                                <button onClick={handleKeySubmit} style={{ backgroundColor: 'blue', color: 'white', border: 'none', padding: '0.5rem 1rem' }}>Submit</button>
                            </div>
                        )}
                    </div>
                </div>
              </div>
       
            )}
    
export default ChatArea;
