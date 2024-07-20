import React, { useState, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';

function ChatArea({ selectedContact, onToggleSidebar }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [online, setOnline] = useState(true); // Simulate online status

    const getRandomChatTheme = () => {
        const colors = ['#ff9a9e', '#fad0c4', '#fcb045', '#f6d365', '#fda085', '#f5a623'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    useEffect(() => {
        if (selectedContact) {
            setMessages([
                { user: selectedContact.name, text: 'Hello!' },
                { user: 'Me', text: 'Hi!' }
            ]);
        }
    }, [selectedContact]);

    useEffect(() => {
        if (typing) {
            const timer = setTimeout(() => {
                setTyping(false);
            }, 2000); // Simulate typing status for 2 seconds
            return () => clearTimeout(timer);
        }
    }, [typing]);


    const handleSend = () => {
        if (message.trim()) {
            setMessages([...messages, { user: 'Me', text: message }]);
            setMessage('');
            setTimeout(() => {
                setMessages(prevMessages => [...prevMessages, { user: selectedContact.name, text: 'How are you?' }]);
            }, 1000);
        }
    };

    const addEmoji=(emoji)=>{
        setMessage(message+emoji);
    };

    if (!selectedContact) {
        return (
            <div className="chat-area d-flex flex-column justify-content-center align-items-center" style={{ flex: 1, height: '100vh' }}>
                <h6>Select a contact to start chatting</h6>
            </div>
        );
    }

    const chatThemeColor= getRandomChatTheme();

    return (
        <div className={`chat-area d-flex flex-column ${isMobile ? 'chat-area-mobile' : ''}`} style={{ flex: 1, height: '100vh', background: `linear-gradient(to bottom right, ${chatThemeColor}, #fff)` }}>
            {isMobile && (
            <div className="chat-header bg-primary text-white p-3 d-flex align-items-center">
                <button className="btn btn-link text-white" onClick={onBack}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <div className="avatar me-2" style={{ backgroundColor: chatThemeColor, width: '40px', height: '40px', borderRadius: '50%' }}>
                        <span className="text-white d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%', fontSize: '1.2rem' }}>
                            {selectedContact.name[0]}
                        </span>
                </div>
                <h6 className="mb-0">{selectedContact.name}</h6>
                <span className={`ms-2 badge ${online ? 'bg-success' : 'bg-secondary'}`}>{online ? 'Online' : 'Offline'}</span>
            </div>
            )}
             {!isMobile && (
                <div className="chat-header bg-primary text-white p-3 d-flex align-items-center">
                    <div className="avatar me-2" style={{ backgroundColor: chatThemeColor, width: '40px', height: '40px', borderRadius: '50%' }}>
                        <span className="text-white d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%', fontSize: '1.2rem' }}>
                            {selectedContact.name[0]}
                        </span>
                    </div>
                    <h6 className="mb-0">{selectedContact.name}</h6>
                    <span className={`ms-2 badge ${online ? 'bg-success' : 'bg-secondary'}`}>{online ? 'Online' : 'Offline'}</span>
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
                    {typing && (
                        <li className="mb-2 text-muted">
                            <div className="d-inline-block p-2 rounded bg-light">
                                {selectedContact.name} is typing...
                            </div>
                        </li>
                    )}
                </ul>
            </div>
            <div className={`chat-input p-3 border-top bg-light ${isMobile ? 'chat-input-mobile' : ''}`}>
                <div className="input-group">
                 <EmojiPicker onEmojiSelect={addEmoji} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Type a message"
                        value={message}
                        onChange={(e) => {
                         setMessage(e.target.value);
                        setTyping(true);
                    }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-primary" onClick={handleSend}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default ChatArea;
