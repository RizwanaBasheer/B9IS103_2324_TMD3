import React, { useState, useEffect, useRef, useContext } from 'react';
import EmojiPicker from './EmojiPicker';
import io from 'socket.io-client';
import axios from 'axios';

function ChatArea({ selectedContact, isMobile, onBack }) {
    const socket = useRef();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [online, setOnline] = useState(true); // Simulate online status
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [keyInput, setKeyInput] = useState(sessionStorage.getItem('key') || '');
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);

    const getRandomChatTheme = () => {
        const colors = ['#ff9a9e', '#fad0c4', '#fcb045', '#f6d365', '#fda085', '#f5a623'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    useEffect(() => {
        socket.current = io('http://localhost:5000', {
            query: { token: sessionStorage.getItem('token') || '' } // Fetch token from sessionStorage or set it as needed
        });

        if (selectedContact) {
            fetchMessages();
            startPolling();
        }

        return () => {
            stopPolling();
        };
    }, [selectedContact]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get('http://localhost:5000/chat/messages', {
                headers: {
                    "Authorization": `${sessionStorage.getItem('token')}`,
                    "x-symmetric-key": keyInput
                }
            });
            console.log(response.data);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const startPolling = () => {
        pollingInterval.current = setInterval(fetchMessages, 1000); // Poll every 3 seconds
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
    };

    const handleSend = () => {
        if (message.trim()) {
            const newMessage = { user: 'Me', content: message };
            setMessages([...messages, newMessage]);
            socket.current.emit('sendMessage', {
                receiverEmail: selectedContact.email, // Adjust based on your data structure
                content: message,
            });
            setMessage('');
            setTyping(true);
            setTimeout(() => {
                setTyping(false);
            }, 2000); // Simulate reply after 2 seconds
        }
    };

    const addEmoji = (emoji) => {
        setMessage(message + emoji);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!selectedContact) {
        return (
            <div className={`chat-area d-flex flex-column justify-content-center align-items-center ${isMobile ? 'd-none' : ''}`} style={{ flex: 1, height: '100vh' }}>
                <h6>Select a contact to start chatting</h6>
            </div>
        );
    }

    const handleKeySubmit = () => {
        sessionStorage.setItem(selectedContact.name, keyInput);
        setDropdownOpen(false);
        // Emit to update the receiver with the key
        socket.current.emit('updateKey', { receiverEmail: selectedContact.email, key: keyInput });
    };


    const chatThemeColor = getRandomChatTheme();

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
            {!isMobile && (
                <div className="chat-header bg-primary text-white p-3 d-flex align-items-center">
                    <div className="avatar me-2" style={{ backgroundColor: chatThemeColor, width: '40px', height: '40px', borderRadius: '50%' }}>
                        <span className="text-white d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%', fontSize: '1.2rem' }}>
                            {selectedContact.name[0]}
                        </span>
                    </div>
                    <h6 className="mb-0">{selectedContact.name}</h6>
                    <span className={`ms-2 badge ${online ? 'bg-success' : 'bg-secondary'}`}>{online ? 'Online' : 'Offline'}</span>
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
                        <li key={index} className={`mb-2 ${msg.user === 'Me' ? 'text-end' : 'text-start'}`}>
                            <div className={`d-inline-block p-2 rounded ${msg.user === 'Me' ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '70%' }}>
                                {msg.content}
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
                    <div ref={messagesEndRef} />
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
