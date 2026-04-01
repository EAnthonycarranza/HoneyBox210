import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import ProductDetail from './pages/ProductDetail';
import ShippingReturns from './pages/ShippingReturns';
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import Events from './pages/Events';
import RequestQuote from './pages/RequestQuote';
import Admin from './pages/Admin';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openLogin) {
      setLoginModalOpen(true);
      // Clear location state after opening modal
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <AuthProvider>
      <CartProvider>
        <Navbar onLoginClick={() => setLoginModalOpen(true)} />
        <CartDrawer />
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/request-quote" element={<RequestQuote />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/shipping" element={<ShippingReturns />} />
          <Route path="/shipping-returns" element={<ShippingReturns />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
