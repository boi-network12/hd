import React from 'react';
import { PaystackButton } from 'react-paystack';
import './PaymentModal.css';
import PropTypes from 'prop-types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';
import emailjs from 'emailjs-com';

const PaymentModal = ({ isOpen, onClose, totalPrice, country, state, zipCode, userEmail, showAlert, cartItems, onPaymentSuccess, userName }) => {
  if (!isOpen) return null; 

  const publicKey = 'pk_test_630476f0340879e41f3b9f62b13a432631b224fa'; 
  const amount = totalPrice * 100;

  const handleVerify = (e) => {
    e.preventDefault();
    console.log('Payment verified');
  };

  // Function to handle storing order details in firestore
  const storeOrderDetails = async () => {
    try {
      const orderIds = [];  // Array to store orderIds
      for (const item of cartItems) {
        const orderData = {
          email: userEmail,
          amount: item.price * item.quantity,
          country,
          state,
          zipCode,
          paymentStatus: 'pending',
          items: cartItems.map(item => ({
            productName: item.title,
            productDesc: item.desc,
            quantity: item.quantity,
            image: item.img[0],
          })),
          timestamp: serverTimestamp()
        };
  
        // Add order to Firestore and get document reference
        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        const orderId = orderRef.id;
  
        // Add orderId to the array
        orderIds.push(orderId);
  
        console.log('Order stored successfully with orderId:', orderId);
      }
      return orderIds;  // Return orderIds array
    } catch (error) {
      console.error('Error storing order details: ', error);
      return []; // Return an empty array in case of error
    }
  };

  // Function to notify admin
  const notifyAdmin = async (orderIds) => {
    try {
      for (const [index, item] of cartItems.entries()) {
        const orderData = {
          type: 'payment',
          email: userEmail,
          amount: item.price * item.quantity,
          country,
          state,
          zipCode,
          paymentStatus: 'pending',
          productName: item.title,
          message: `${item.desc} - This is a new order with Order ID: ${orderIds[index] || 'N/A'}`,
          timestamp: serverTimestamp(),
        };
  
        // Add order notification to Firestore
        await addDoc(collection(db, 'orderToAdmin'), orderData);
        console.log('Admin notified successfully with orderId:', orderIds[index]);
      }
    } catch (error) {
      console.error('Error notifying admin: ', error.message);
      console.error('Error details: ', error);
    }
  };

  // Function to send email using Emailjs
  const sendEmail = async (orderIds) => {
    try {
      const emailParams = {
        to_name: userName,
        from_name: "neo welding",
        user_email: userEmail,
        cart_items: cartItems.map((item, index) => {
          // Use orderId from the orderIds array
          const orderId = orderIds[index] || 'N/A'; 
          return `Order ID: ${orderId}, Product: ${item.title}, Quantity: ${item.quantity}, Price: &#8358;${new Intl.NumberFormat().format(item.price.toFixed(2))}`;
        }).join('\n'),
        total_price: totalPrice.toFixed(2),
        country,
        state,
        zip_code: zipCode,
      };
  
      await emailjs.send('service_rblqnbj', 'template_nspdbgp', emailParams, '5dv_gAb8jYc6kN4WZ');
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Stack trace:', error.stack);
    }
  };

  const componentProps = {
    email: userEmail,
    amount,
    metadata: {
      country,
      state,
      zipCode,
    },
    publicKey,
    text: "Verify Payment",
    onSuccess: async () => {
      showAlert("success", "Payment Successful!");
      const orderIds = await storeOrderDetails();  // Ensure orders are stored first to get orderIds
      await Promise.all([notifyAdmin(orderIds), sendEmail(orderIds)]);  // Notify admin and send email after storing orders
      onPaymentSuccess();
    },
    onClose: () => showAlert("info", "Wait! Don't leave :("),
  };

  console.log('Component Props:', componentProps); // Debugging line

  return (
    <div className='modalOverlay'>
      <div className='modalContent'>
        <button onClick={onClose}>Close</button>
        <h2>Payment</h2>
        <p>Total Price: &#8358;{new Intl.NumberFormat().format(totalPrice.toFixed(2))}</p>
        <p>Country: {country}</p>
        <p>State/City: {state}</p>
        <p>Zip Code: {zipCode}</p>
        <form onSubmit={handleVerify}>
          <PaystackButton className="paystack-button" {...componentProps} />
        </form>
      </div>
    </div>
  );
};

PaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  totalPrice: PropTypes.number.isRequired,
  country: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  zipCode: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
  cartItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    desc: PropTypes.string,
    img: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,
  showAlert: PropTypes.func.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
};

export default PaymentModal;
