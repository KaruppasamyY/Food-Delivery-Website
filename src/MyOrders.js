import React, { useState, useEffect } from 'react';
import './Home.css'; // Assuming you have your CSS in home.css
import { Link } from 'react-router-dom';
import { assets, food_list } from './assets/assets';
import './Cart';

function MyOrders() {
    const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cartItems')) || {});
  const [orders, setOrders] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/order/history/${userId}`);
        const ordersData = await response.json();
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [userId]);

  useEffect(() => {
        updateCartIndicator();
      }, [cartItems]);
  
    const updateCartIndicator = () => {
      const dot = document.querySelector('.dot');
      if (dot) {
        dot.style.display = Object.keys(cartItems).length > 0 ? 'block' : 'none';
      }
    };

  const handleBasketClick = () => {
    const cartItemsString = localStorage.getItem("cartItems");
    const cartItemsObject = cartItemsString ? JSON.parse(cartItemsString) : {};
    const cartItemCount = Object.keys(cartItemsObject).length;

    if (cartItemCount === 0) {
      alert("Your cart is empty. Please add at least one item to proceed.");
      window.location.href = "/"; // Assuming "/" is your home route
    } else {
      window.location.href = "/cart"; // Assuming "/cart" is your cart route
    }
  };

  return (
    <>
      <div className="app">
        <div className="navbar">
          <Link to="/">
            <img id="logo" src={assets.logo} alt="Company Logo" className="logo" />
          </Link>
          <ul className="navbar-menu">
            <Link to="/" id="home">home</Link>
            <a href="#footer" id="contact-us">contact us</a>
          </ul>
          <div className="navbar-right">
            <img id="search-icon" src={assets.search_icon} alt="Search" />
            <div className="navbar-search-icon">
              <img id="basket-icon" src={assets.basket_icon} alt="Basket" onClick={handleBasketClick} />
              <div className="dot"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-orders">
        <h2>My Orders</h2>
        <div className="container" id="orders-container">
          {orders.length > 0 ? (
            orders.map((order) => {
              const itemsText = order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ");
              const orderDate = new Date(order.orderDate).toLocaleDateString();

              return (
                <div className="my-orders-order" key={order._id}>
                  <img src={assets.parcel_icon} alt="Parcel Icon" />
                  <p><strong>Items:</strong><br />{itemsText}</p>
                  <p><strong>Total:</strong> £{order.totalPrice}.00</p>
                  <p><strong>Order Date:</strong> {orderDate}</p>
                  <p><strong>Delivery Details:</strong><br />
                    {order.deliveryAddress.firstname} {order.deliveryAddress.lastname},{" "}
                    {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
                    {order.deliveryAddress.state}, {order.deliveryAddress.zipcode},{" "}
                    {order.deliveryAddress.country}, {order.deliveryAddress.phone}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="no-orders-message">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', textAlign: 'center' }}>
                <img src={assets.parcel_icon} alt="Empty Cart" style={{ width: '100px', marginBottom: '20px' }} />
                <p style={{ fontSize: '1.2em', color: '#666' }}>No orders made yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <section id="contactus">
        <div className="footer" id="footer">
          <div className="footer-content">
            <div className="footer-content-left">
              <img className="footer-logo" src={assets.logo} alt="Eatco Logo" />
              <p>Delicious meals, delivered to your door. Fresh ingredients, great flavors, and fast
                service—because you deserve the best!</p>
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

export default MyOrders;