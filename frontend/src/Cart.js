import React, { useState, useEffect } from 'react';
import './Home.css';
import { assets, menu_list, food_list } from './assets/assets';
import { Link } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState({});
  const [category, setCategory] = useState('All');

  useEffect(() => {
    loadCartFromLocalStorage();
    renderCartItems();
    updateCartTotal();

    if (window.setOnLoginSuccess) {
      window.setOnLoginSuccess(fetchCartOnLogin);
    }

    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchCartOnLogin(userId);
    }
  }, []);

  useEffect(() => {
    saveCartToLocalStorage();
    renderCartItems();
    updateCartTotal();
    updateCartIndicator();
  }, [cartItems]);

  const fetchCartOnLogin = (userId) => {
    fetch(`http://localhost:5000/cart/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched cart data on login:', data);
        const newCartItems = {};
        if (data && data.items) {
          data.items.forEach((item) => {
            newCartItems[item.foodItemId] = item.quantity;
          });
        }
        setCartItems(newCartItems);
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
        renderCartItems();
        updateCartTotal();
      })
      .catch((error) => {
        console.error('Error fetching cart on login:', error);
        loadCartFromLocalStorage();
      });
  };

  const updateCartIndicator = () => {
    const dot = document.querySelector('.dot');
    if (dot) {
      dot.style.display = Object.keys(cartItems).length > 0 ? 'block' : 'none';
    }
  };

  const loadCartFromLocalStorage = () => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  };

  const addToCart = (id) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please sign in to add items to your cart.');
      return;
    }

    const foodItem = food_list.find((item) => item._id === id);
    if (!foodItem) {
      console.error('Food item not found:', id);
      return;
    }

    const itemToAdd = {
      userId: userId,
      foodItemId: foodItem._id,
      name: foodItem.name,
      price: foodItem.price,
    };

    fetch('http://localhost:5000/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemToAdd),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Item added to cart on server:', data);
        setCartItems((prevCartItems) => ({
          ...prevCartItems,
          [id]: (prevCartItems[id] || 0) + 1,
        }));
      })
      .catch((error) => {
        console.error('Error adding item to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      });
  };

  const removeFromCart = (id) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please sign in.');
      return;
    }

    fetch('http://localhost:5000/cart/remove', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId, foodItemId: id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Item removed from cart on server:', data);
        setCartItems((prevCartItems) => {
          const newCartItems = { ...prevCartItems };
          if (newCartItems[id]) {
            newCartItems[id]--;
            if (newCartItems[id] === 0) {
              delete newCartItems[id];
            }
          }
          return newCartItems;
        });
      })
      .catch((error) => {
        console.error('Error removing item from cart:', error);
        alert('Failed to remove item from cart. Please try again.');
      });
  };

  const saveCartToLocalStorage = () => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  };

  const renderCartItems = () => {
    const cartItemsList = document.getElementById('cart-items-list');
    if (cartItemsList) {
      cartItemsList.innerHTML = '';

      Object.keys(cartItems).forEach((id) => {
        if (cartItems[id] > 0) {
          const item = food_list.find((food) => food._id === id);
          if (item) {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-items-title', 'cart-items-item');

            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;

            const name = document.createElement('p');
            name.innerText = item.name;

            const price = document.createElement('p');
            price.innerText = `£${item.price}`;

            const quantity = document.createElement('p');
            quantity.innerText = `${cartItems[id]}`;

            const total = document.createElement('p');
            total.innerText = `£${item.price * cartItems[id]}`;

            const addButton = document.createElement('p');
            addButton.classList.add('plus');
            addButton.innerText = '+';
            addButton.addEventListener('click', () => addToCart(id));

            const removeButton = document.createElement('p');
            removeButton.classList.add('cross');
            removeButton.innerText = 'x';
            removeButton.addEventListener('click', () => removeFromCart(id));

            cartItemDiv.appendChild(img);
            cartItemDiv.appendChild(name);
            cartItemDiv.appendChild(price);
            cartItemDiv.appendChild(quantity);
            cartItemDiv.appendChild(total);
            cartItemDiv.appendChild(addButton);
            cartItemDiv.appendChild(removeButton);

            cartItemsList.appendChild(cartItemDiv);
          }
        }
      });
    }
  };

  const getTotalCartAmount = () => {
    return Object.keys(cartItems).reduce((total, id) => {
      const item = food_list.find((food) => food._id === id);
      return item ? total + item.price * cartItems[id] : total;
    }, 0);
  };

  const updateCartTotal = () => {
    const subTotal = getTotalCartAmount();
    const deliveryFee = subTotal === 0 ? 0 : 2;
    const total = subTotal + deliveryFee;

    const subTotalElement = document.getElementById('sub-total');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalElement = document.getElementById('total');

    if (subTotalElement) subTotalElement.textContent = `£${subTotal}`;
    if (deliveryFeeElement) deliveryFeeElement.textContent = `£${deliveryFee}`;
    if (totalElement) totalElement.textContent = `£${total}`;
  };

  const handleApplyPromo = () => {
    const promoCodeElement = document.getElementById('promo-code');
    const promoCode = promoCodeElement ? promoCodeElement.value : '';
    alert(`Promo code applied: ${promoCode}`);
  };

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

      <div className="cart">
        <div className="cart-items">
          <div className="cart-items-title">
            <p>Items</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Add</p>
            <p>Remove</p>
          </div>
          <br />
          <hr />
          <div id="cart-items-list"></div>
        </div>

        <div className="cart-bottom">
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
            {Object.keys(cartItems).length > 0 ? (
                <Link to="place_order">
                  <button id="checkout-btn">PROCEED TO CHECKOUT</button>
                </Link>
              ) : (
                <button id="checkout-btn" disabled>
                  CART SHOULD NOT BE EMPTY
                </button>
              )}
          </div>

          <div className="cart-promocode">
            <div>
              <p>If you have promo code, Enter it here</p>
              <div className="cart-promocode-input">
                <input type="text" id="promo-code" placeholder="promo code" />
                <button id="apply-promo" onClick={handleApplyPromo}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default Cart;