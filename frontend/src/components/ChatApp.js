import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

function ChatApp(props) {
  const [selectedContact, setSelectedContact] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


  const handleSelectContact = (contact) => {
    console.log(sessionStorage.getItem(contact.name));
    if (sessionStorage.getItem(contact.name) === null) {
      
      sessionStorage.setItem(contact.name, '12345678')
    }

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
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-md-row'}`} style={{ height: '100vh' }}>
      {showSidebar && (
        <Sidebar onSelectContact={handleSelectContact} selectedContact={selectedContact} isMobile={isMobile} apiUrl={props.apiUrl}/>
      )}
      <div className={`flex-fill ${isMobile && !showSidebar ? 'chat-area-fullscreen' : ''}`}>
        <ChatArea
          selectedContact={selectedContact}
          isMobile={isMobile}
          onBack={handleBackToContacts}
          setSelectedContact={setSelectedContact}
          apiUrl={props.apiUrl}
        />
      </div>
    </div>
  );
}

export default ChatApp;
