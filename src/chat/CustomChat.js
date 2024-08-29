import React from 'react'
import { useAuth } from '../Context/AuthContext'
import "./CustomChat.css"

const CustomChat = () => {
  const { currentUser, message, setMessage, handleSendMessage, messages } = useAuth();

  return (
    <div className='custom-chat-container'>
      <div className='chat-messages'>
        {currentUser ? (
          messages.map((msg, index) => (
            <div key={index} className={msg.sender === currentUser?.uid ? 'chat-bubble-user' : 'chat-bubble-guest'}>
              <p>{msg.text}</p>
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>No user</p>
        )}
      </div>
      {currentUser && (
        <div className='chat-input'>
          <textarea 
            cols="30" 
            rows="10"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Type a message...'
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};


export default CustomChat