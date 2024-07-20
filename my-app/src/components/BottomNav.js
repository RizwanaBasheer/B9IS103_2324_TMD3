import React from 'react';

function BottomNav({ onToggleSidebar, onToggleChatArea, activeView }) {
  return (
    <div className="bottom-nav bg-light border-top d-md-none fixed-bottom">
      <div className="d-flex justify-content-around p-2">
        <button
          className={`btn btn-link ${activeView === 'sidebar' ? 'active' : ''}`}
          onClick={onToggleSidebar}
        >
          <i className="bi bi-person-circle"></i>
        </button>
        <button
          className={`btn btn-link ${activeView === 'chat' ? 'active' : ''}`}
          onClick={onToggleChatArea}
        >
          <i className="bi bi-chat-dots"></i>
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
