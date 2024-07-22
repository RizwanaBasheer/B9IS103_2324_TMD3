import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

function ChatApp() {
    const [selectedContact, setSelectedContact] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        if (isMobile) {
            setShowSidebar(false);
        }
    };

    const handleBackToContacts = () => {
        setSelectedContact(null);
        setShowSidebar(true);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-md-row'}`} style={{ height: '100vh' }}>
            {showSidebar && (
                <Sidebar onSelectContact={handleSelectContact} selectedContact={selectedContact} isMobile={isMobile} />
            )}
            <div className={`flex-fill ${isMobile && !showSidebar ? 'chat-area-fullscreen' : ''}`}>
                <ChatArea
                    selectedContact={selectedContact}
                    isMobile={isMobile}
                    onBack={handleBackToContacts}
                />
            </div>
        </div>
    );
}

export default ChatApp;
