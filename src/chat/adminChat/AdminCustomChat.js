import React, { useEffect, useState } from 'react';
import './AdminCustomChat.css';
import { useAuth } from '../../Context/AuthContext';
import { ref, set } from 'firebase/database';
import { realTimeDb } from '../../FirebaseConfig';

const AdminCustomChat = () => {
  const { adminMessages, handleSendMessage, setMessage, message } = useAuth();

  // State to manage selected user and list of unique users
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get unique users from messages
  const uniqueUsers = [...new Set(adminMessages.map((msg) => msg.sender))];

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true); // Open the modal when a user is clicked
  
    // Mark all messages as read
    const userMessages = adminMessages.filter(
      (msg) => msg.sender === userId || msg.recipientId === userId
    );
  
    userMessages.forEach((msg) => {
      if (!msg.read) {  // If the message is not read
        const messageRef = ref(realTimeDb, `chat/adminChat/messages/${msg.id}`);
        set(messageRef, { ...msg, read: true });
      }
    });
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null); // Clear the selected user when closing the modal
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.className === 'modal-overlay') {
        closeModal();
      }
    };
  
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className='admin-chat-container'>
      <div className='user-list'>
        <h3>Users</h3>
        {uniqueUsers.length > 0 ? (
          uniqueUsers.map((userId) => {
            const hasUnreadMessages = adminMessages.some(
              (msg) => (msg.sender === userId || msg.recipientId === userId) && !msg.read
            );
            
            return (
              <div key={userId} onClick={() => handleUserClick(userId)}>
                <p>
                  {userId} {hasUnreadMessages && <span className="unread-indicator">&#8226;</span>}
                </p>
              </div>
            );
          })
        ) : (
          <p>No users have sent messages yet.</p>
        )}
      </div>


      {/* Modal for Chat */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal'>
            <button className='close-button' onClick={closeModal}>
              &times; {/* Close button */}
            </button>
            <div className='chat-messages1'>
            {adminMessages
              .filter((msg) => msg.sender === selectedUserId || msg.recipientId === selectedUserId)
              .map((msg, index) => (
                <div key={index} className='chat-bubble'>
                  <p>{msg.text}</p>
                  <small>{new Date(msg.timestamp).toLocaleString()}</small>
                </div>
              ))}

            </div>

            <div className='chat-input1'>
              <input
                type='text'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Type a reply...'
              />
              <button onClick={() => handleSendMessage(selectedUserId)}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomChat;


