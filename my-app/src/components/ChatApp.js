import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

function ChatApp() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setShowSidebar(false); // Hide sidebar on small screens when a contact is selected
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      <Sidebar onSelectContact={handleSelectContact} showSidebar={showSidebar} />
      <ChatArea selectedContact={selectedContact} onToggleSidebar={handleToggleSidebar} />
    </div>
  );
}

export default ChatApp;
