import React, { useState, useEffect } from 'react';

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
    
    
    return (
        <div>
            {/* ChatArea structure */}
        </div>
    );
}

export default ChatArea;
