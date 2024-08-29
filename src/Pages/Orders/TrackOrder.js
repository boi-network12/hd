import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { analytics, db } from '../../FirebaseConfig';
import './TrackOrder.css';
import { logEvent } from 'firebase/analytics';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'Track order page'
    })
  })

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    

    try {
      const orderDoc = doc(db, 'orders', orderId);
      const docSnap = await getDoc(orderDoc);

      if (docSnap.exists()) {
        setOrderDetails({ ...docSnap.data(), id: docSnap.id });
      } else {
        setError('No such order found!');
        setOrderDetails(null);
      }
    } catch (error) {
      setError('Error fetching order details');
      console.error('Error fetching order details:', error);
      setOrderDetails(null);
    }

    setLoading(false);
  };

  return (
    <div className='TrackOrderWrapper'>
      <h2>Track Your Order</h2>
      <form onSubmit={handleTrackOrder}>
        <input
          type='text'
          placeholder='Enter Order ID'
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
        />
        <button type='submit' disabled={loading}>
          {loading ? 'Loading...' : 'Track Order'}
        </button>
      </form>

      {error && <p className='error'>{error}</p>}

      {orderDetails && (
        <div className='orderDetails'>
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {orderDetails.id}</p>
          <p><strong>Status:</strong> {orderDetails.paymentStatus}</p>
          <p><strong>Total Amount:</strong> &#8358;{new Intl.NumberFormat().format(orderDetails.amount)}</p>
          <p><strong>Items---</strong></p>
          {orderDetails.items && orderDetails.items.length > 0 ? (
            <ul>
              {orderDetails.items.map((item, index) => (
                <li key={index}>
                  <p><strong>productName: </strong> {item.productName}</p>
                  <p><strong>quantity: </strong> {item.quantity}</p>
                  {item.image && (
                    <div className='itemImage'>
                      <img src={item.image} alt={item.productName} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No items found for this order.</p>
          )}
          <p><strong>Order Date:</strong> {orderDetails.timestamp?.toDate().toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
