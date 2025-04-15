import React, { useState, useEffect } from 'react';
import './Home.css'; // Assuming you have your CSS in home.css
import { assets, food_list } from './assets/assets'; // Assuming you have your food_list data
import { Link } from 'react-router-dom';
import './Cart';

import checked from './assets/checked.png';
import un_checked from './assets/un_checked.png'
import MyOrders from './MyOrders';

function PlaceOrder() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState({
    firstname: '',
    lastname: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cartItems')) || {});
  const [totalPrice, setTotalPrice] = useState(0); // Initialize as a number
  const [orderCompleted, setOrderCompleted] = useState(false);

  const checkedImageSrc = checked; // Replace with your actual path
  const uncheckedImageSrc = un_checked; // Replace with your actual path

  const stripe = window.Stripe('pk_test_51R3049AhxCSYrkaWJ7nlLBVhMjRdxbNCIjRat0Pnvs2R3iKVyNcfc5zvfa0So9ZXuFRRqBFPqRdVwTH3I2wEAZZr00S53cJyGA'); // Replace with your key

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId && !orderCompleted) {
      handleStripeOrderCompletion(sessionId);
    }
  }, [orderCompleted]);

  useEffect(() => {
      saveCartToLocalStorage();
      updateCartTotal();
      updateCartIndicator();
    }, [cartItems]);

    const saveCartToLocalStorage = () => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      };
    
    const updateCartTotal = () => {
        let subTotal = 0;
        Object.keys(cartItems).forEach((id) => {
          const foodItem = food_list.find((item) => item._id === id);
          if (foodItem) {
            subTotal += foodItem.price * cartItems[id];
          }
        });
        const deliveryFee = 2; // Assuming a fixed delivery fee
        const total = subTotal + deliveryFee;
        setTotalPrice(total);
    
        document.getElementById('sub-total').textContent = `£${subTotal.toFixed(2)}`;
        document.getElementById('delivery-fee').textContent = `£${deliveryFee.toFixed(2)}`;
        document.getElementById('total').textContent = `£${total.toFixed(2)}`;
      };

  const updateCartIndicator = () => {
    const dot = document.querySelector('.dot');
    if (dot) {
      dot.style.display = Object.keys(cartItems).length > 0 ? 'block' : 'none';
    }
  };

  const handleInputChange = (e) => {
    setDeliveryDetails({
      ...deliveryDetails,
      [e.target.placeholder.toLowerCase().replace(/ /g, '')]: e.target.value,
    });
  };

  const areDeliveryDetailsFilled = () => {
    return Object.values(deliveryDetails).every((value) => value) && selectedPaymentMethod;
  };

  const updateButtonState = () => {
    const placeOrderBtn = document.getElementById('cart-total-button');
    if (!areDeliveryDetailsFilled()) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerText = 'Fill Delivery Details';
      return;
    }

    if (selectedPaymentMethod === 'cod') {
      placeOrderBtn.innerText = 'PLACE YOUR ORDER';
    } else if (selectedPaymentMethod === 'stripe') {
      placeOrderBtn.innerText = 'PROCEED TO PAYMENT';
    } else {
      placeOrderBtn.innerText = 'Select Payment Method';
    }
    placeOrderBtn.disabled = false;
  };

  const updatePaymentDisplay = () => {
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach((option) => {
      const img = option.querySelector('img');
      const isCOD = option.textContent.trim().startsWith('COD');
      const isStripe = option.textContent.trim().startsWith('Stripe');

      if (img) {
        img.src =
          (isCOD && selectedPaymentMethod === 'cod') || (isStripe && selectedPaymentMethod === 'stripe')
            ? checkedImageSrc
            : uncheckedImageSrc;
      }
    });
  };

  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
    updatePaymentDisplay();
    updateButtonState();
  };

  const handlePlaceOrderClick = (event) => {
    event.preventDefault();

    if (!areDeliveryDetailsFilled()) {
      alert('Please fill in the delivery details and select the payment method.');
      return;
    }

    if (selectedPaymentMethod === 'cod') {
      if (window.confirm('Are you sure you want to place this order?')) {
        placeOrder();
      }
    } else if (selectedPaymentMethod === 'stripe') {
      stripeOrder();
    } else {
      alert('Please select a payment method.');
    }
  };

  const placeOrder = () => {
    const cartItemsString = localStorage.getItem('cartItems');
    const cartItemsObject = cartItemsString ? JSON.parse(cartItemsString) : {};
    const userId = localStorage.getItem('userId');

    const items = Object.keys(cartItemsObject).map((id) => {
      const foodItem = food_list.find((item) => item._id === id);
      return {
        name: foodItem.name,
        price: foodItem.price,
        quantity: cartItemsObject[id],
      };
    });

    const orderData = {
      userId: userId,
      items: items,
      totalPrice: totalPrice,
      deliveryAddress: deliveryDetails,
    };

    fetch('http://localhost:5000/order/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(() => {
        document.getElementById('order-success').classList.remove('hidden');
        return fetch('http://localhost:5000/cart/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId }),
        });
      })
      .then(() => {
        localStorage.removeItem('cartItems');
        setTimeout(() => {
          window.location.href = '/my_orders';
        }, 1500); // 3000 ms = 3 seconds
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while placing your order.');
      });
  };

  const stripeOrder = () => {
    const cartItemsString = localStorage.getItem('cartItems');
    const cartItemsObject = cartItemsString ? JSON.parse(cartItemsString) : {};
    const userId = localStorage.getItem('userId');

    const items = Object.keys(cartItemsObject).map((id) => {
      const foodItem = food_list.find((item) => item._id === id);
      return {
        name: foodItem.name,
        price: foodItem.price,
        quantity: cartItemsObject[id],
      };
    });

    const baseUrl = window.location.origin + window.location.pathname;
    const deliveryFee = 2;
    const orderData = {
      userId: userId,
      items: items,
      totalPrice: totalPrice,
      deliveryFee: deliveryFee,
      deliveryAddress: deliveryDetails,
      success_url: `${baseUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: baseUrl,
    };

    localStorage.setItem('stripe_orderData', JSON.stringify(orderData));

    fetch('http://localhost:5000/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })
      .then((res) => res.json())
      .then((data) => stripe.redirectToCheckout({ sessionId: data.id }))
      .catch((error) => {
        console.error('Stripe error:', error);
        alert('Stripe checkout error.');
      });
  };

  const handleStripeOrderCompletion = (sessionId) => {
    if (sessionStorage.getItem(`orderCompleted_${sessionId}`)) {
      return; // Order already completed for this session
    }

    sessionStorage.setItem(`orderCompleted_${sessionId}`, 'true'); // Set the flag

    const orderData = JSON.parse(localStorage.getItem('stripe_orderData'));
    if (!orderData) {
      alert('Order data missing.');
      return;
    }

    fetch('http://localhost:5000/order/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to save order.');
        return response.json();
      })
      .then(() =>
        fetch('http://localhost:5000/cart/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: orderData.userId }),
        })
      )
      .then(() => {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('stripe_orderData');

        const successElement = document.getElementById('order-success');
        if (successElement) {
          successElement.classList.remove('hidden');
        }

        //Remove the session id from the url.
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        setTimeout(() => {
          window.location.href = '/my_orders';
        }, 1500); // 3000 ms = 3 seconds      
      })
      .catch((error) => {
        console.error('Error finalizing Stripe order:', error);
        alert('Error completing your order after payment.');
      });
  };

  useEffect(() => {
    updateButtonState();
    updatePaymentDisplay();
  }, [deliveryDetails, selectedPaymentMethod]);

  return (
    <>
    <div className="app">
      <div className="navbar">
        <Link to="/">
          <img id="logo" src={assets.logo} alt="Company Logo" className="logo" />
        </Link>
        <ul className="navbar-menu">
          <Link to="/" id="home">
            home
          </Link>
          <a href="#footer" id="contact-us">
            contact us
          </a>
        </ul>
        <div className="navbar-right">
          <img id="search-icon" src={assets.search_icon} alt="Search" />
          <div className="navbar-search-icon">
            <Link to="/cart">
              <img id="basket-icon" src={assets.basket_icon} alt="Basket" />
            </Link>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      <form className="place-order" onSubmit={handlePlaceOrderClick}>
        <div className="place-order-left">
          <p className="title">Delivery Information</p>
          <div className="multi-field">
            <input type="text" placeholder="First name" value={deliveryDetails.firstname} onChange={handleInputChange} required />
            <input type="text" placeholder="Last name" value={deliveryDetails.lastname} onChange={handleInputChange} required />
          </div>
          <input type="text" placeholder="Email" value={deliveryDetails.email} onChange={handleInputChange} required />
          <input type="text" placeholder="Street" value={deliveryDetails.street} onChange={handleInputChange} required />
          <div className="multi-field">
            <input type="text" placeholder="City" value={deliveryDetails.city} onChange={handleInputChange} required />
            <input type="text" placeholder="State" value={deliveryDetails.state} onChange={handleInputChange} required />
          </div>
          <div className="multi-field">
            <input type="text" placeholder="zip Code" value={deliveryDetails.zipcode} onChange={handleInputChange} required />
            <input type="text" placeholder="Country" value={deliveryDetails.country} onChange={handleInputChange} required />
          </div>
          <input type="text" placeholder="Phone" value={deliveryDetails.phone} onChange={handleInputChange} required />
        </div>
        <div className="place-order-right">
          <div className="cart-total">
            <h2>Cart Total</h2>
            <div>
              <div className="cart-total-details">
                <p>SubTotal</p>
                <p id="sub-total">£0</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p id="delivery-fee">£0</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b id="total">£0</b>
              </div>
            </div>
            <div className="payment">
              <h2>Payment Method</h2>
              <div className="payment-option" onClick={() => handlePaymentSelection('cod')}>
              <img src={selectedPaymentMethod === 'cod' ? checkedImageSrc : uncheckedImageSrc} alt="COD Status" />
                <p>COD ( Cash on delivery )</p>
              </div>
              <div className="payment-option" onClick={() => handlePaymentSelection('stripe')}>
              <img src={selectedPaymentMethod === 'stripe' ? checkedImageSrc : uncheckedImageSrc} alt="Stripe Status" />
                <p>Stripe ( Credit / Debit )</p>
              </div>
            </div>
            <button id="cart-total-button" type="submit"></button>
            <div id="order-success" className="order-success hidden">
              <img src={assets.parcel_icon} alt="Success Tick" className="tick-icon" />
              <p>Your order has been placed successfully!</p>
            </div>
          </div>
        </div>
      </form>
    </div>

    <section id="contactus">
            <div className="footer" id="footer">
              <div className="footer-content">
                <div className="footer-content-left">
                  <img className="footer-logo" src={assets.logo} alt="Eatco Logo" />
                  <p>
                    Delicious meals, delivered to your door. Fresh ingredients, great flavors, and fast service—because you deserve the best!
                  </p>
                  <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="Facebook" />
                    <img src={assets.twitter_icon} alt="Twitter" />
                    <img src={assets.linkedin_icon} alt="LinkedIn" />
                  </div>
                </div>
                <div className="footer-content-center">
                  <h2>COMPANY</h2>
                  <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy policy</li>
                  </ul>
                </div>
                <div className="footer-content-right">
                  <h2>GET IN TOUCH</h2>
                  <ul>
                    <li>+4401234567890</li>
                    <li>contact@eatco.com</li>
                  </ul>
                </div>
              </div>
              <hr />
              <p className="footer-copyright">Copyright 2025 &copy; Eatco.com - All Rights Reserved.</p>
            </div>
          </section>
          </>
  );
}

export default PlaceOrder;