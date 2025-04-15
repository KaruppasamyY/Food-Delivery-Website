import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './Home.css';
import { assets, menu_list, food_list } from './assets/assets';
import { Link } from 'react-router-dom';

function Home() {
  const [category, setCategory] = useState('All');
  const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cartItems')) || {});
  const [menuList, setMenuList] = useState(menu_list);
  const [foodList, setFoodList] = useState(food_list);
  const [showProfileOptions, setShowProfileOptions] = useState(false);

  const [currState, setCurrState] = useState('Login');
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newForgotPassword, setNewForgotPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Run only once on component mount

  useEffect(() => {
    const logo = document.getElementById('logo');
    if (logo) {
      const handleLogoClick = () => {
        window.location.href = '/'; // Navigate to home.html
      };
      logo.addEventListener('click', handleLogoClick);

      return () => {
        logo.removeEventListener('click', handleLogoClick);
      };
    }
  }, []); // Run only once on component mount

  useEffect(() => {
    loadCartFromLocalStorage();
    updateCartIndicator();
    renderMenu();
    renderFoodItems();
    renderCartItems();
    updateCartTotal();

    if (window.setOnLoginSuccess) {
      window.setOnLoginSuccess(fetchCartOnLogin);
    }

    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchCartOnLogin(userId);
      updateAuthUI();
    }

    const scrollUpBtn = document.getElementById('scrollUpBtn');
    window.onscroll = () => {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        if (scrollUpBtn) scrollUpBtn.style.display = 'block';
      } else {
        if (scrollUpBtn) scrollUpBtn.style.display = 'none';
      }
    };
    if (scrollUpBtn) {
      scrollUpBtn.onclick = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      };
    }

    document.body.classList.add('loaded');

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('Please sign in to place an order.');
          return;
        }
        window.location.href = '/order';
      };
    }
  }, []);

  const homeRef = useRef(null);
  const menuRef = useRef(null);
  const appRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const navbarMenuItems = document.querySelectorAll('.navbar-menu a');

    function handleMenuClick(menuItems) {
        menuItems.forEach((item) => {
          item.addEventListener('click', function () {
            menuItems.forEach((el) => {
              el.classList.remove('active');
            });
            this.classList.add('active');
          });
        });
    }

    handleMenuClick(navbarMenuItems);

    function updateActiveClassOnScroll() {
        let activeLink = null;
        let activeHref = '';
  
        if (menuRef.current && homeRef.current && window.scrollY < menuRef.current.offsetTop) {
          activeLink = document.querySelector('.navbar-menu a#home');
          activeHref = '/';
        } else if (menuRef.current && appRef.current && window.scrollY >= menuRef.current.offsetTop && window.scrollY < appRef.current.offsetTop) {
          activeLink = document.querySelector('.navbar-menu a#menu');
          activeHref = '#explore-menu';
        } else if (appRef.current && footerRef.current && window.scrollY >= appRef.current.offsetTop && window.scrollY < footerRef.current.offsetTop) {
          activeLink = document.querySelector('.navbar-menu a#mobile-app');
          activeHref = '#app-download';
        } else if (footerRef.current && window.scrollY >= footerRef.current.offsetTop) {
          activeLink = document.querySelector('.navbar-menu a#contact-us');
          activeHref = '#footer';
        }
  
        navbarMenuItems.forEach((el) => {
          el.classList.remove('active');
        });
  
        if (activeLink) {
          activeLink.classList.add('active');
          activeLink.href = activeHref;
        }
      }

    window.addEventListener('scroll', updateActiveClassOnScroll);

    // Initial call to set active class based on initial scroll position
    updateActiveClassOnScroll();

    // Cleanup: Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', updateActiveClassOnScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (hamburgerRef.current) {
      const toggleMenuHandler = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
      };
  
      hamburgerRef.current.addEventListener('click', toggleMenuHandler);
  
      return () => {
        if (hamburgerRef.current) {
          hamburgerRef.current.removeEventListener('click', toggleMenuHandler);
        }
      };
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    saveCartToLocalStorage();
  }, [cartItems]);

  useEffect(() => {
    updateAuthUI();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        document.getElementById('profile-icon') &&
        document.getElementById('profile-options') &&
        !document.getElementById('profile-icon').contains(event.target) &&
        !document.getElementById('profile-options').contains(event.target)
      ) {
        setShowProfileOptions(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const updateAuthUI = () => {
    if (isLoggedIn) {
      document.getElementById('sign-in-btn').style.display = 'none';
      document.getElementById('profile-icon').style.display = 'inline-block';
    } else {
      document.getElementById('sign-in-btn').style.display = 'inline-block';
      document.getElementById('profile-icon').style.display = 'none';
      setShowProfileOptions(false);
    }
  };

  const togglePopup = (popupType) => {
    if (popupType === 'login') {
      setShowLoginPopup(true);
      setShowForgotPasswordPopup(false);
      setCurrState('Login');
    } else if (popupType === 'forgot') {
      setShowForgotPasswordPopup(true);
      setShowLoginPopup(false);
    } else {
      setShowLoginPopup(false);
      setShowForgotPasswordPopup(false);
    }
    document.body.classList.toggle('no-scroll', showLoginPopup || showForgotPasswordPopup);
  };

  useEffect(() => {
    //always set the correct no-scroll state on popup state change.
    document.body.classList.toggle('no-scroll', showLoginPopup || showForgotPasswordPopup);
  }, [showLoginPopup, showForgotPasswordPopup]);

  const updatePopupState = (newState) => {
    setCurrState(newState);
    setName('');
    setEmail('');
    setPassword('');
    setAgreeTerms(false);
  };

  const toggleState = () => {
    updatePopupState(currState === 'Login' ? 'Sign Up' : 'Login');
  };

  const handleFormSubmission = async (url, data, successMessage, errorHandler) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        alert(successMessage);
        return result;
      } else {
        console.error(`Error:`, result.message);
        errorHandler(result);
        return null;
      }
    } catch (error) {
      console.error('Submission Error:', error);
      alert('Something went wrong, please try again.');
      return null;
    }
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    if (!forgotEmail) {
      alert('Please enter your email address.');
      return;
    }
    if (!newForgotPassword) {
      alert('Please enter your new password.');
      return;
    }
    if (newForgotPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }

    const data = await handleFormSubmission(
      'http://localhost:5000/user/change-password',
      { email: forgotEmail, newPassword: newForgotPassword },
      'Password reset successful! You can now log in.',
      (errorData) => {
        if (errorData && errorData.message === 'User not found') {
          alert('No user found with that email address.');
        } else {
          alert(`Password reset failed: ${errorData.message || 'Something went wrong.'}`);
        }
      }
    );
    if (data) {
      togglePopup('login');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!agreeTerms) {
      alert('You must agree to the terms and conditions.');
      return;
    }

    const isLogin = currState === 'Login';
    const endpoint = isLogin ? 'http://localhost:5000/user/login' : 'http://localhost:5000/user/signup';

    const data = isLogin ? { email, password } : { name, email, password };

    try {
      const responseData = await handleFormSubmission(endpoint, data, `${currState} successful!`, (errorResult) => {
        console.error(`${currState} Error:`, errorResult.message);
        if (errorResult.message && errorResult.message.includes('Email already in use')) {
          alert('Email already exists! Switching to login...');
          updatePopupState('Login');
        } else if (errorResult.message && errorResult.message.includes('Invalid credentials, incorrect email')) {
          alert('Email not found! Switching to sign up...');
          updatePopupState('Sign Up');
        } else if (errorResult.message && errorResult.message.includes('Invalid credentials, incorrect password')) {
          alert('Incorrect password.');
        } else {
          alert(`Error: ${errorResult.message || 'Something went wrong.'}`);
        }
      });

      if (responseData) {
        if (isLogin && responseData.userId) {
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', responseData.userId);
          updateAuthUI();
          togglePopup();
          fetchCartOnLogin(responseData.userId);
        } else if (!isLogin) {
          updatePopupState('Login');
        }
      }
    } catch (error) {
      console.error(`${currState} Error:`, error);
      alert('Something went wrong, please try again.');
    }
  };

  const handleBasketClick = (event) => {
    const userId = localStorage.getItem('userId');
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || {};
    const isCartEmpty = Object.keys(cartItems).length === 0;

    if (!userId) {
      event.preventDefault();
      alert('Please sign in to view your cart.');
      window.scrollTo(0, 0);
      setTimeout(() => {
        const signInButton = document.getElementById('sign-in-btn');
        if (signInButton) {
          signInButton.click();
        }
      }, 200);
      return;
    }

    if (isLoggedIn && isCartEmpty) {
      event.preventDefault();
      alert('Your cart is empty. Please add at least one item to proceed.');
      return;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('cartItems');
    window.location.reload();
    updateAuthUI();
    setShowProfileOptions(false);
  };

  useEffect(() => {
    renderMenu();
    renderFoodItems();
  }, [category]); // Re-run when 'category' changes

  const updateCartIndicator = () => {
    const dot = document.querySelector('.dot');
    if (dot) {
      dot.style.display = Object.keys(cartItems).length > 0 ? 'block' : 'none';
    }
  };

  const renderMenu = () => {
    const menuListContainer = document.getElementById('explore-menu-list');
    if (menuListContainer) {
      menuListContainer.innerHTML = '';
  
      menuList.forEach((item) => {
        const menuItem = document.createElement('div');
        menuItem.classList.add('explore-menu-list-item');
  
        const img = document.createElement('img');
        img.src = item.menu_image;
        img.alt = item.menu_name;
  
        menuItem.appendChild(img);
  
        const p = document.createElement('p');
        p.innerText = item.menu_name;
        menuItem.appendChild(p);
  
        menuItem.addEventListener('click', () => {
          setCategory(category === item.menu_name ? 'All' : item.menu_name);
        });
  
        menuItem.classList.toggle('active', category === item.menu_name);
        menuItem.classList.toggle('inactive', category !== item.menu_name);
  
        menuListContainer.appendChild(menuItem);
      });
    }
  };

  const renderFoodItems = () => {
    const foodListContainer = document.getElementById('food-display-list');
    if (foodListContainer) {
      foodListContainer.innerHTML = '';

      const filteredItems = foodList.filter((item) => category === 'All' || item.category === category);
      if (filteredItems.length === 0) {
        foodListContainer.innerHTML = "<h1 className='empty-message'>No items found.</h1>";
        return;
      }

      filteredItems.forEach((item) => {
        const foodItem = document.createElement('div');
        foodItem.classList.add('food-item');

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('food-item-img-container');

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.classList.add('food-item-image');

        let cartControl;
        if (!cartItems[item._id]) {
          cartControl = document.createElement('img');
          cartControl.src = assets.add_icon_white;
          cartControl.classList.add('add');
          cartControl.addEventListener('click', () => addToCart(item._id));
        } else {
          cartControl = document.createElement('div');
          cartControl.classList.add('food-item-counter');

          const removeBtn = document.createElement('img');
          removeBtn.src = assets.remove_icon_red;
          removeBtn.addEventListener('click', () => removeFromCart(item._id));

          const qty = document.createElement('p');
          qty.innerText = cartItems[item._id];

          const addBtn = document.createElement('img');
          addBtn.src = assets.add_icon_green;
          addBtn.addEventListener('click', () => addToCart(item._id));

          cartControl.appendChild(removeBtn);
          cartControl.appendChild(qty);
          cartControl.appendChild(addBtn);
        }

        imgContainer.appendChild(img);
        imgContainer.appendChild(cartControl);

        const foodInfo = document.createElement('div');
        foodInfo.classList.add('food-item-info');

        const nameRatingContainer = document.createElement('div');
        nameRatingContainer.classList.add('food-item-name-rating');

        const name = document.createElement('p');
        name.innerText = item.name;

        const ratingImg = document.createElement('img');
        ratingImg.src = assets.rating_starts;

        nameRatingContainer.appendChild(name);
        nameRatingContainer.appendChild(ratingImg);

        const description = document.createElement('p');
        description.classList.add('food-item-desc');
        description.innerText = item.description;

        const price = document.createElement('p');
        price.classList.add('food-item-price');
        price.innerText = `£${item.price}`;

        foodInfo.appendChild(nameRatingContainer);
        foodInfo.appendChild(description);
        foodInfo.appendChild(price);

        foodItem.appendChild(imgContainer);
        foodItem.appendChild(foodInfo);
        foodListContainer.appendChild(foodItem);
      });
    }
  };

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
        updateCartIndicator();
        renderFoodItems();
        renderCartItems();
        updateCartTotal();
      })
      .catch((error) => {
        console.error('Error fetching cart on login:', error);
        loadCartFromLocalStorage();
      });
  };

  const loadCartFromLocalStorage = () => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  };

  useEffect(() => {
    renderCartItems();
    updateCartTotal();
    updateCartIndicator();
    renderMenu();
    renderFoodItems();
  }, [cartItems]); // Re-run when 'cartItems' changes

  const addToCart = (id) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.scrollTo(0, 0);
        alert('Please sign in to add items to your cart.');
        togglePopup('login');
        return;
    }

    const foodItem = foodList.find((item) => item._id === id);
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
      togglePopup('login');
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
    updateCartIndicator();
  };

  const renderCartItems = () => {
    const cartItemsList = document.getElementById('cart-items-list');
    if (cartItemsList) {
      cartItemsList.innerHTML = '';

      Object.keys(cartItems).forEach((id) => {
        if (cartItems[id] > 0) {
          const item = foodList.find((food) => food._id === id);
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
      const item = foodList.find((food) => food._id === id);
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Optional: adds smooth scrolling animation
    });
  };

  return (
    <div>
        {showLoginPopup && (
        <div id="login-popup" className="login-popup" style={{ display: 'grid' }}>
            <form id="login-popup-container" className="login-popup-container" onSubmit={handleSubmit}>
            <div className="login-popup-title">
                <h2 id="popup-title">{currState}</h2>
                <img id="close-btn" src={assets.cross_icon} alt="Close" onClick={() => togglePopup()} />
            </div>
            <div id="login-popup-inputs" className="login-popup-inputs">
            {currState === 'Sign Up' && <input id="name" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />}
            <input id="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="login-popup-forgot" id="forgot-password-container-link">
            <a
            id="forgot-password-link"
            href="#forgot"
            onClick={(e) => {
              e.preventDefault();
              togglePopup('forgot');
            }}
            style={{ display: currState === 'Login' ? 'block' : 'none', textDecoration: 'none', color: 'tomato', fontWeight: "bold" }}
            >
            Forgot Password?
            </a>
            </div>
            <button id="submit-btn" type="submit">
              {currState === 'Login' ? 'Login' : 'Create account'}
            </button>
            <div className="login-popup-condition">
              <input id="check-box" type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} />
              <label htmlFor="check-box">I agree to the terms and conditions</label>
            </div>
            <div id="switch-action">
                {currState === 'Login' ? (
                <>
                Create a new account? <span id="switch-to-signup" className="switch-link" style={{color: 'tomato', cursor: 'pointer', fontWeight: "bold"}} onClick={() => toggleState()}>Click here</span>
                </>
                ) : (
                <>
                Already have an account? <span id="switch-to-login" className="switch-link" style={{color: 'tomato', cursor: 'pointer', fontWeight: "bold"}} onClick={() => toggleState()}>Login here</span>
                </>
                )}
            </div>
          </form>
        </div>
      )}

      {showForgotPasswordPopup && (
        <div id="forgot-password-popup" className='login-popup' style={{ display: 'grid' }}>
          <form id="forgot-password-container" className="login-popup-container" onSubmit={handleForgotPasswordSubmit}>
          <div className="login-popup-title">
              <h2>Forgot Password</h2>
              <img id="close-forgot-password-btn" src={assets.cross_icon} alt="Close" onClick={() => togglePopup()} />
            </div>
            <div className="login-popup-inputs">
            <input id="forgot-email" type="email" placeholder="Email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
            <input id="new-forgot-password" type="password" placeholder="New Password" value={newForgotPassword} onChange={(e) => setNewForgotPassword(e.target.value)} required />
            </div>
            <button id="reset-password-btn" type="submit">
              Reset Password
            </button>
            <span>Remember your password? <a id="back-to-login" style={{textDecoration : "none", color: 'tomato', display: "inline", fontWeight: "bold"}} href="#login" onClick={(e) => {e.preventDefault(); togglePopup('login');}}>Back to Login</a></span>
          </form>
        </div>
      )}


      <div className="app">
        <div className="navbar" ref={homeRef}>
          <img id="logo" src={assets.logo} alt="Company Logo" className="logo" />
          <ul className="navbar-menu">
            <Link to="/" id="home" className="active">
              home
            </Link>
            <a href="#explore-menu" id="menu">
              menu
            </a>
            <a href="#app-download" id="mobile-app">
              mobile-app
            </a>
            <a href="#footer" id="contact-us">
              contact us
            </a>
          </ul>
          <div className="navbar-right">
            <img id="search-icon" src={assets.search_icon} alt="Search" />
            <div className="navbar-search-icon">
              <Link to="/cart" onClick={handleBasketClick}>
                <img id="basket-icon" src={assets.basket_icon} alt="Basket" />
                </Link>
              <div className="dot"></div>
            </div>
            <div style={{ position: 'relative' }}>
              <button id="sign-in-btn" onClick={() => togglePopup('login')}>
                Sign In
              </button>
              <img
                id="profile-icon"
                src={assets.profile_icon}
                alt="Profile"
                onClick={() => setShowProfileOptions(!showProfileOptions)}
                style={{ display: isLoggedIn ? 'inline-block' : 'none' }}
              />
              <div id="profile-options" className="profile-options" style={{ display: showProfileOptions ? 'block' : 'none' }}>
                <div id="bag-option" onClick={() => { setShowProfileOptions(false); /* Implement bag logic */ }}>
                  <Link to="/my_orders" style={{ textDecoration: 'none', color: 'black' }}>
                    <img className="orders-img" src={assets.bag_icon} alt="My Orders" />
                    <span className="orders">Orders</span>
                  </Link>
                </div>
                <div id="logout-option" onClick={handleLogout}>
                  <img className="logout-img" src={assets.logout_icon} alt="Logout" />
                  <span className="logout">Logout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={hamburgerRef} className="hamburger" id="hamburger">
          ☰
        </div>
        <div ref={mobileMenuRef} className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} id="mobileMenu">
          <Link to="/" onClick={scrollToTop} id="home" className='active'>home</Link>
          <a href="#explore-menu">menu</a>
          <a href="#app-download">mobile-app</a>
          <a href="#footer">contact us</a>
        </div>

        <div className="header">
          <div className="header-contents">
            <h2>Order your favourite food here</h2>
            <p>
              Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.
            </p>
            <a href="#explore-menu">
              <button id="view-menu-btn">View Menu</button>
            </a>
          </div>
        </div>
        <section id="exploremenu" ref={menuRef}>
          <div id="explore-menu" className="explore-menu">
            <h1>Explore our menu</h1>
            <p className="explore-menu-text">
              Craving something tasty? Our menu is packed with a diverse selection of flavorful dishes made from the freshest ingredients. Whether you're in the mood for classic comfort food, exotic international flavors, or healthy choices, we've got something for everyone. Explore our menu and indulge in a delightful dining experience!
            </p>
            <div id="explore-menu-list" className="explore-menu-list">
              {/* Menu items will be inserted here */}
            </div>
            <hr />
          </div>
        </section>

        <div className="food-display" id="food-display">
          <h2>Top dishes near you</h2>
          <div id="food-display-list" className="food-display-list">
            {/* Food items will be inserted here */}
          </div>
        </div>

        <section id="mobileapp" ref={appRef}>
          <div className="app-download" id="app-download">
            <p>
              For Better Experience Download <br /> EatCo. App
            </p>
            <div className="app-download-platforms">
              <img id="play-store" src={assets.play_store} alt="Play Store" />
              <img id="app-store" src={assets.app_store} alt="App Store" />
            </div>
          </div>
        </section>
      </div>

      <section id="contactus" ref={footerRef}>
        <div className="footer" id="footer">
          <div className="footer-content">
            <div className="footer-content-left">
              <img className="footer-logo" src={assets.logo} alt="Eatco Logo" />
              <p>Delicious meals, delivered to your door. Fresh ingredients, great flavors, and fast service—because you deserve the best!</p>
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

      <button id="scrollUpBtn">↑</button>
    </div>
  );
}

export default Home;