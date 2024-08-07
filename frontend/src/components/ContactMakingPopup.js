import React, { useState, useContext } from 'react';
import { OnlineUsersContext } from '../context/OnlineUsersContext';

const ContactMakingPopup = ({ show, onClose, onAddContact }) => {
  const [email, setEmail] = useState('');
  const onlineUsers = useContext(OnlineUsersContext);
  
  const filteredUsers = onlineUsers
    .filter(user => (user.email || '').toLowerCase().includes(email.toLowerCase()));  

  const handleAddContact = () => {
    const newContact = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
    };
    onAddContact(newContact);
    onClose();
  };

  return (
    show ? (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Contact</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="contactEmail" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="contactEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                {filteredUsers && filteredUsers.map(user => (
                  <button
                    key={user.id} // Ensure the key is unique
                    type="button"
                    className="btn btn-outline-secondary d-block mb-2"
                    onClick={() => setEmail(user.email)}
                  >
                    {user.email}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-primary" onClick={handleAddContact}>Add</button>
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
};

export default ContactMakingPopup;
