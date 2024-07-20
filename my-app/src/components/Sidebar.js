import React, { useState } from 'react';

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
            className="list-group-item d-flex align-items-center" 
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            style={{ cursor: 'pointer' }}
          >
            <img src={contact.avatar} alt={contact.name} className="rounded-circle me-2" style={{ width: '40px', height: '40px' }} />
            <span>{contact.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
