import React, { useState, useEffect, useRef, useContext } from 'react';
import EmojiPicker from './EmojiPicker';
import axios from 'axios';
import { OnlineUsersContext } from '../context/OnlineUsersContext';

function ChatArea({ selectedContact, isMobile,onBack, setSelectedContact,apiUrl}) {
    const onlineUsers = useContext(OnlineUsersContext)
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]); // Ensure messages is initialized as an empty array
    const [typing, setTyping] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [keyInput, setKeyInput] = useState('');
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);

    const getRandomChatTheme = () => {
        const colors = ['#ff9a9e', '#fad0c4', '#fcb045', '#f6d365', '#fda085', '#f5a623'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    useEffect(() => {
        if (selectedContact) {
            fetchMessages();
            startPolling();
        }

        return () => {
            stopPolling();
        };
    }, [selectedContact]);

    const [contactMessages, setContactMessages] = useState({});

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${apiUrl}/chat/messages`, {
                headers: {
                    "Authorization": `${sessionStorage.getItem('token')}`,
                    "x-symmetric-key": sessionStorage.getItem(selectedContact.name)
                }
            });
    
            const messagesForContact = response.data.messages.filter(msg => 
                msg.senderEmail === selectedContact.email || msg.recieverEmail === selectedContact.email
            );
    
            setContactMessages(prevState => ({
                ...prevState,
                [selectedContact.email]: messagesForContact
            }));
    
            setMessages(messagesForContact);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };    

    const startPolling = () => {
        pollingInterval.current = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
    };

    const handleSend = async () => {
        if (message.trim()) {
            const newMessage = { userPosition: 'sender', content: message };
            setMessages([...messages, newMessage]);

            try {
                await axios.post(`${apiUrl}/chat/send`, {
                    receiverEmail: selectedContact.email,
                    content: message,
                }, {
                    headers: {
                        "Authorization": `${sessionStorage.getItem('token')}`,
                    }
                });

                setMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
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
        sessionStorage.setItem(selectedContact.name, keyInput.trim());
        setDropdownOpen(false);
    };

    const online = onlineUsers.some(user => user.email === selectedContact?.email);
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
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (

                            <li key={index} className={`mb-2 ${msg.userPosition === 'sender' ? 'text-end' : 'text-start'}`}>
                                <div className={`d-inline-block p-2 rounded ${msg.userPosition === 'sender' ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '70%' }}>
                                    {msg.content}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="mb-2 text-muted">
                            No messages yet
                        </li>
                    )}
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
