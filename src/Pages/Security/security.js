import React, { useEffect, useState } from 'react';
import './security.css';
import Footer from '../../Components/footer/Footer';
import { useAuth } from '../../Context/AuthContext';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import {ThreeDots} from "react-loader-spinner"
import { FaGoogle } from 'react-icons/fa6';
import { useAlert } from '../../Context/AlertContext';
import ScrollToTopButton from '../../Components/ScrollTop/ScrollToTop';

const Security = () => {
  const [isSignup, setIsSignup] = useState(true); 
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signup, login, googleRegister } = useAuth();
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();

useEffect(() => {
  logEvent(analytics, 'page_view', {
    page_title: 'security page'
  })
})

  const toggleForm = () => {
    setIsSignup(!isSignup); // Toggle between true and false
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/")
      showAlert('success', 'signup successfully!')
    } catch (error) {
      console.error("Error signing up: ", error);
      showAlert('error', 'Error signing up')
    } finally{
      setLoading(false);
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await googleRegister();
      navigate("/"); 
      showAlert('success', 'Google Authentication successful!')
    } catch (error) {
      console.error("Error with Google Authentication: ", error);
      const errorMessage = error.message || 'Google Authentication failed. Please try again';
      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/")
      showAlert('success', 'login successfully!')
    } catch (error) {
      console.error("Error trying to Login: ", error);
      showAlert('error', 'Error signing up')
    } finally{
      setLoading(false)
    }

  }

  return (
    <div className='securityWrapper'>
      <div className='securityContainer'>
        {loading ? (
          <ThreeDots
            color="#333"
            height={80}
            width={80}
          />
        ) : isSignup ? (
          <form onSubmit={handleSignup}>
            <h3>register </h3>
            <div>
              <label>Full name <span>*</span></label>
              <input type="text" 
                placeholder='FULL NAME'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label>Email <span>*</span></label>
              <input type="email" 
                  placeholder='example@gmail.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Password <span>*</span></label>
              <input type="password" 
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='buttonAndGoogle'>
              <button type="submit">Sign Up</button>
              <FaGoogle className="googleImg" onClick={handleGoogleAuth}/>
            </div>
            <span onClick={toggleForm} className='toggleSpan'>Already have an account? Login</span>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <h3>welcome back</h3>
            <div>
              <label>Email <span>*</span></label>
              <input type="email" 
                  placeholder='example@gmail.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Password <span>*</span></label>
              <input type="password" 
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='buttonAndGoogle'>
              <button type="submit">Login</button>
              <FaGoogle className="googleImg" onClick={handleGoogleAuth}/>
            </div>
            <span onClick={toggleForm} className='toggleSpan'>Don't have an account? Sign Up</span>
          </form>
        )}
      </div>
      <Footer />
      <ScrollToTopButton/>
    </div>
  );
};

export default Security;
