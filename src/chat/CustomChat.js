import React from 'react'
import { useAuth } from '../Context/AuthContext'
import "./CustomChat.css"

const CustomChat = () => {
  const { currentUser, message, setMessage, handleSendMessage, messages} = useAuth()
 
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
          <p>no user</p>
        )}
      </div>
      {currentUser && (
        <div className='chat-input'>
          <textarea 
              cols="30" 
              rows="10"
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Type a message...'
          ></textarea>
        <button onClick={handleSendMessage}>send</button>
      </div>
      )}
    </div>
    // this is components for guest and currentUser.role === 'user'
  )
}

export default CustomChat