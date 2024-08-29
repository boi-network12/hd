import React, { useEffect } from 'react'
import "./AboutPages.css"
import Footer from '../../Components/footer/Footer'
import { analytics } from '../../FirebaseConfig';
import { logEvent } from 'firebase/analytics';

const AboutPages = () => {
    useEffect(() => {
        logEvent(analytics, 'page_view', {
          page_title: 'about page',
        });
      }, []);
    
  return (
    <div>
        <Footer/>
    </div>
  )
}

export default AboutPages