import React, { useState, useEffect, useRef } from 'react';
import randomColor from 'randomcolor';
import axios from 'axios';
import ContactMakingPopup from './ContactMakingPopup';

function Sidebar({ onSelectContact, selectedContact, isMobile }) {
  const socket = useRef();
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({ name: '', profilePic: '', email: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [contacts, setContacts] = useState([]);
  const handleShowPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);

  const handleAddContact = (newContact) => {
    const contactExists = contacts.some(contact => contact.email === newContact.email);
    if (newContact.email === userData.email) {
      alert('You cannot select your own contact.');
    } else {
      console.log(newContact);
      if (contactExists) {
        alert('Contact already exists.');
      } else {
        setContacts(prevContacts => [...prevContacts, newContact]);
        alert('Contact added successfully.');
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/user', {
          headers: {
            "Authorization": `${sessionStorage.getItem('token')}`,
          }
        });

        setUserData({
          name: response.data.name,
          profilePic: response.data.profilePic,
          email: response.data.email // Store the user's email
        });

        const existingContacts = response.data.contacts.map(email => ({
          id: Math.random().toString(36).substr(2, 9), // Generate a random ID
          name: email.split('@')[0], // Use the email's local part as the name
          email: email,
        }));

        // Check for duplicates and add new contacts
        setContacts(prevContacts => {
          const allContacts = [...prevContacts, ...existingContacts];
          const uniqueContacts = Array.from(new Set(allContacts.map(contact => contact.email)))
            .map(email => allContacts.find(contact => contact.email === email));
          return uniqueContacts;
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRandomColor = () => randomColor({ luminosity: 'light', format: 'hex' });

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/auth/logout', {
        headers: {
          Authorization: `${sessionStorage.getItem('token')}`
        }
      });
      sessionStorage.removeItem('token');
      sessionStorage.removeItem(selectedContact.name);
      alert('Logged out!');
      window.location.reload(); // Refresh the page or redirect to the login page
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to log out.');
    }
  };

  return (
    <div className={`sidebar bg-light border-end ${isMobile ? 'sidebar-mobile' : ''}`} style={{ height: '100vh', width: isMobile ? '100vw' : '250px', overflowY: 'auto' }}>
      <div className="p-3 d-flex justify-content-between align-items-center bg-primary text-white">
        <div className="d-flex align-items-center">
          <img src={userData.profilePic} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <span className="ms-2">{userData.name}</span>
        </div>
        <div className="dropdown">
          <button className="btn btn-link text-white" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <i className="bi bi-three-dots-vertical"></i>
          </button>
          {dropdownOpen && (
            <ul className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', right: 0 }}>
              <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
            </ul>
          )}
        </div>
      </div>
      <div className="p-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search contacts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="ms-2">

        <ContactMakingPopup
          show={showPopup}
          onClose={handleClosePopup}
          onAddContact={handleAddContact}
          userData={userData}
          selectedContactEmail={selectedContact ? selectedContact.email : ''}
        />
      </div>
      <ul className="list-group">
        {filteredContacts.map((contact) => (
          <>
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
          </>
        ))}
      </ul>
      <button className="btn btn-primary ms-auto ms-2 mt-3 p-2 px-3 fw-bold" onClick={handleShowPopup}>+</button>
    </div>
  );
}

export default Sidebar;
