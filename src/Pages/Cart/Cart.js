import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useAlert } from '../../Context/AlertContext';
import { useCart } from '../../Context/CartContext';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../FirebaseConfig';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../../Modal/PaymentModal/PaymentModal';

const Cart = () => {



  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const showAlert = useAlert();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    logEvent(analytics, 'page_view', {
      page_title: 'cart page',
    });
  }, []);

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId, action) => {
    const item = cartItems.find((item) => item.id === productId);
    if (item) {
      const newQuantity = action === 'increment' ? item.quantity + 1 : item.quantity - 1;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateCartTotal = () => {
    let subtotal = calculateSubtotal();
    let discountAmount = 0;
    const discountRate = 0.1;

    if (appliedCoupon) {
      discountAmount = subtotal * discountRate;
    }

    return subtotal - discountAmount;
  };

  const handleApplyCoupon = () => {
    if (couponCode === 'DISCOUNT10') {
      setDiscount(0.1);
      setAppliedCoupon(true);
      showAlert('success', 'Coupon applied successfully!');
    } else {
      showAlert('error', 'Invalid coupon code.');
    }
  };

  const clearCart = () => {
    cartItems.forEach(item => removeFromCart(item.id));
  };

  const handleOrder = () => {
    if (cartItems.length === 0) {
      showAlert('error', 'Your cart is empty. Please add products to your cart before ordering.');
      return;
    }

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!country || !state || !zipCode) {
      showAlert('error', 'Please enter your country, state/city, and zip code.');
      return;
    }

    setTotalPrice(calculateCartTotal());
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setIsPaymentModalOpen(false);
    showAlert('success', 'Payment Successful! Your cart has been cleared.');
  };

  return (
    <div className='CartWrapper'>
      <h2>Shopping Bag</h2>
      <p>
        <span>{cartItems.length} items</span> in your bag
      </p>
      <div className='CartGrid'>
        <div className='CartOrderView'>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className='CartItem'>
                <img src={item.img[0]} alt={item.title} />
                <div className='ItemDetails'>
                  <p>
                    <strong>{item.title}</strong>
                  </p>
                  <p>{item.desc}</p>
                </div>
                <div className='ItemPrice'>
                  <p>&#8358;{new Intl.NumberFormat().format(item.price.toFixed(2))}</p>
                  <div className='QuantityControl'>
                    <button onClick={() => handleQuantityChange(item.id, 'decrement')}>-</button>
                    <span>{item.quantity}</span>
                                        <button onClick={() => handleQuantityChange(item.id, 'increment')}>+</button>
                  </div>
                  <p className='TotalPrice'>
                    &#8358;{new Intl.NumberFormat().format((item.price * item.quantity).toFixed(2))}
                    
                  </p>
                  <button className='btnRemove' onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className='placeHolderItem'>No products yet in your cart.</p>
          )}
        </div>

        <div className='CartSummary'>
          <h3>Order Summary</h3>
          <form>
            <input
              style={{ width: '100%' }}
              type='text'
              placeholder='Country'
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <input
              style={{ width: '46%' }}
              type='text'
              placeholder='State/city'
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <input
              style={{ width: '46%' }}
              type='text'
              placeholder='Zip code'
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
            <button type='button' onClick={() => showAlert('info', 'Location updated')}>
              Update
            </button>
          </form>
          <div className='summaryTotal'>
            <h4>Cart Total</h4>
            <p>
              <span>Cart Subtotal:</span>
              <span>&#8358;{new Intl.NumberFormat().format(calculateSubtotal().toFixed(2))}</span>
            </p>
            <p>
              <span>Discount:</span>
              <span>&#8358;{new Intl.NumberFormat().format(appliedCoupon ? (calculateSubtotal() * 0.1).toFixed(2) : discount.toFixed(2))}</span>
            </p>
            <p>
              <span>Cart Total:</span>
              <span>&#8358;{new Intl.NumberFormat().format(calculateCartTotal().toFixed(2))}</span>
            </p>
            <input
              type='text'
              placeholder='Enter coupon code'
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            {couponCode && (
              <button type='button' onClick={handleApplyCoupon}>
                Apply Coupon
              </button>
            )}
            <button type='button' onClick={handleOrder}>
              Order
            </button>
          </div>
        </div>
      </div>

      {/* Render the PaymentModal and pass props */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        totalPrice={totalPrice}
        country={country}
        state={state}
        zipCode={zipCode}
        userEmail={currentUser?.email}
        userName={currentUser?.displayName}
        showAlert={showAlert}
        cartItems={cartItems} // Pass the detailed product information
        onPaymentSuccess={handlePaymentSuccess} // Pass the success handler
      />
    </div>
  );
};

export default Cart;
