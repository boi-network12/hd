import React, { useEffect, useState } from 'react';
import "./ReviewsPage.css";
import { logEvent } from 'firebase/analytics';
import { analytics, db } from '../../FirebaseConfig';
import placeHolderImage from "../../Assets/Image/placeholderImage.png";
import { useAuth } from '../../Context/AuthContext';
import { useAlert } from '../../Context/AlertContext';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const ReviewsPage = () => {
  const { currentUser } = useAuth();
  const showAlert = useAlert();
  const [loading, setLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'Review page'
    });

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showAlert('error', 'You must be logged in to submit a review!');
      return;
    }

    setLoading(true);
    try {
      const newReview = {
        name: currentUser.displayName || 'Anonymous',
        desc: reviewText,
        userImg: currentUser.photoURL || placeHolderImage,
        timestamp: new Date()
      };

      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews(prevReviews => [...prevReviews, { ...newReview, id: docRef.id }]);
      setReviewText("");
      showAlert('success', 'Review sent!');
    } catch (error) {
      showAlert('error', 'Can\'t send review!');
      console.error('Error cannot send review: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='reviewWrapper'>
      {/* Review List */}
      <div className='HomeReviewInfoContainer'>
        {loading ? (
          <p>Loading reviews...</p>
        ) : (
          reviews.map((item) => (
            <div key={item.id} className='userInfoImg'>
              <img src={item.userImg} alt={item.name} />
              <div className='userInfo'>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Input */}
      {currentUser && (
        <form className='reviewInput' onSubmit={handleSubmitReview}>
          <textarea 
            placeholder='Write a review'
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          ></textarea>
          <button type='submit' disabled={loading}>
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewsPage;
