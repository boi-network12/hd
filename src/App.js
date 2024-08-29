import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AlertProvider } from './Context/AlertContext';
import AuthProvider from './Context/AuthContext';
import LoadingContext from './Context/LoadingContext';
import Home from './Pages/Home/Home';
import Header from './Components/Navbar/Header';
import Security from './Pages/Security/security';
import ReviewsPage from './Pages/Reviews/ReviewsPage';
import Cart from './Pages/Cart/Cart';
import { CartProvider } from './Context/CartContext';
import Dashboard from './Pages/Dashboard/Dashboard';
import PrivateRoute from './Private/PrivateRoute';
import TrackOrder from './Pages/Orders/TrackOrder';
import PostOrder from './Admin/Pages/PostOrder/PostOrder';
import ReviewOrder from './Admin/Pages/ReviewOrder/ReviewOrder';
import { LikeProvider } from './Context/LikeContext';
import Products from './Pages/shop/Product';
import UsersDisplay from './Admin/Pages/users/usersDisplay';
import CustomChat from './chat/CustomChat';

// Import your chat icon from react-icons or any icon library
import { FaComments, FaTimes } from 'react-icons/fa'; 
import AdminCustomChat from './chat/adminChat/AdminCustomChat';

function App() {
  const [isChatVisible, setIsChatVisible] = useState(false); // State to toggle chat visibility
  const chatRef = useRef(null); // Ref to the chat component

  // Function to toggle chat visibility
  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  // Function to handle click outside chat
  const handleClickOutside = (event) => {
    if (chatRef.current && !chatRef.current.contains(event.target)) {
      setIsChatVisible(false);
    }
  };

  // Function to handle scroll outside chat
  const handleScroll = () => {
    setIsChatVisible(false);
  };

  useEffect(() => {
    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <AuthProvider>
      <LoadingContext>
        <CartProvider>
          <LikeProvider>
          <AlertProvider>
              <Router>
                {/* header  */}
                <Header/>
                <Routes>
                  <Route path="/" element={<Home/>} />
                  <Route path="/home" element={<Home/>} />
                  <Route path="/login" element={<Security/>} />
                  <Route path="/reviews" element={<ReviewsPage/>} />
                  <Route path="/cart" element={<Cart/>} />
                  <Route path="/products" element={<Products/>} />
                  <Route path="/dashboard" element={<PrivateRoute element={Dashboard}/>} />
                  <Route path="/orders" element={<PrivateRoute element={TrackOrder}/>} />
                  <Route path="/postorder" element={<PrivateRoute element={PostOrder}/>} />
                  <Route path="/revieworder" element={<PrivateRoute element={ReviewOrder}/>} />
                  <Route path="/user_display" element={<PrivateRoute element={UsersDisplay}/>} />
                  <Route path="/custom_admin_chat" element={<PrivateRoute element={AdminCustomChat}/>} />
                </Routes>
              </Router>

              {/* Floating Chat Icon */}
              <div className="chat-icon" onClick={toggleChat}>
                {isChatVisible ? <FaTimes size={25} color="#fff" /> : <FaComments size={25} color="#fff" />}
              </div>

              {/* Conditional Rendering of the CustomChat */}
              {isChatVisible && <CustomChat ref={chatRef} />}
          </AlertProvider>
          </LikeProvider>
        </CartProvider>
      </LoadingContext>
    </AuthProvider>
  );
}

export default App;
