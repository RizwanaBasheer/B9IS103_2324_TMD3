import React, { useState } from 'react';
import randomColor from 'randomcolor';

const contacts = [
  { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/40' },
  { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/40' },
  { id: 3, name: 'Bob Johnson', avatar: 'https://via.placeholder.com/40' },
];

function Sidebar({ onSelectContact, showSidebar }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRandomColor = () => randomColor({ luminosity: 'light', format: 'hex' });

  return (
    <div className={`sidebar bg-light border-end ${showSidebar ? 'd-block' : 'd-none'} d-md-block`} style={{ width: '250px', height: '100vh', overflowY: 'auto' }}>
      <div className="p-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className="list-group">
        {filteredContacts.map((contact) => (
          <li 
            className={`list-group-item d-flex align-items-center ${selectedContact && selectedContact.id === contact.id ? 'active' : ''}`}
            key={contact.id}
            onClick={() => onSelectContact(contact)}
          >
            <div className="avatar me-2" style={{ backgroundColor: getRandomColor(), width: '40px', height: '40px', borderRadius: '50%' }}>
              <span className="text-white d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%', fontSize: '1.2rem' }}>
                {contact.name[0]}
              </span>
            </div>
            <span>{contact.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
