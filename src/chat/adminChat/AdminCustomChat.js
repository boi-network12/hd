import React, { useState } from 'react';
import './AdminCustomChat.css';
import { useAuth } from '../../Context/AuthContext';

const AdminCustomChat = () => {
  const { adminMessages, handleSendMessage, setMessage, message } = useAuth();

  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div className='admin-chat-container'>
      <div className='user-list'>
          <h3>Users</h3>
          {adminMessages.length > 0 ? (
              adminMessages.map((msg) => (
                  <div key={msg.id} onClick={() => handleUserClick(msg.sender)}>
                      <p>{msg.sender}</p>
                  </div>
              ))
          ) : (
              <p>No users have sent messages yet.</p>
          )}
      </div>


      <div className='chat-messages'>
        {selectedUserId ? (
          adminMessages
            .filter((msg) => msg.sender === selectedUserId)
            .map((msg, index) => (
              <div key={index} className='chat-bubble'>
                <p>{msg.text}</p>
                <small>{new Date(msg.timestamp).toLocaleString()}</small>
              </div>
            ))
        ) : (
          <p>Select a user to view messages</p>
        )}
      </div>

      {selectedUserId && (
        <div className='chat-input'>
          <input 
            type='text' 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Type a reply...'
          />
          <button onClick={() => handleSendMessage(selectedUserId)}>Send</button>
        </div>
      )}
    </div>
  );
};

export default AdminCustomChat;
