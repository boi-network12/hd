import React, { useEffect, useState } from 'react';
import "./HomeReview.css";
import { Link } from "react-router-dom";
import { useAlert } from '../../Context/AlertContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';

const HomeReview = () => {
  const showAlert = useAlert();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'reviews'));
        const fetchedReviews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(fetchedReviews);
      } catch (error) {
        console.error('Error fetching reviews: ', error);
        showAlert('error', 'Error fetching reviews!');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();

    // Clean up function
    return () => {
      // Optional: Any cleanup logic can be placed here
    };
  }, [showAlert]);

  return (
    <div className='HomeReviewWrapper'>
      <div className='HomeReviewFirstDivContainer'>
        <h2>what our customers say</h2>
        <div>
          <p>
            hear from our satisfied customers.
          </p>
          <Link to="/reviews"><p>view all</p></Link>
        </div>
      </div>
      {/* second one */}
      <div className='HomeReviewInfoContainer'>
        {loading ? (
          <p>Loading reviews ...</p>
        ) : (
          reviews.slice(0, 3).map((item) => (
            <div key={item.id} className='userInfoImg'>
              <img src={item.userImg} alt="" />
              <div>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HomeReview;
