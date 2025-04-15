import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Cart from './Cart';
import PlaceOrder from './Place_Order';
import MyOrders from './MyOrders';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart/place_order" element={<PlaceOrder />} />
        <Route path="/my_orders" element={<MyOrders />} />
      </Routes>
    </Router>
  );
}

export default App;