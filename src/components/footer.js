"use client";
import React from 'react';
import { usePathname } from 'next/navigation'; // Import the usePathname hook
import './footer.css'; // Import your CSS for styling

const Footer = () => {
  const pathname = usePathname(); // Get the current pathname

  // Do not render Footer if on the /login, /dashboard, or /clear-inbox pages
  if (pathname === '/login' || pathname === '/dashboard' || pathname === '/clear-inbox') {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:support@inboxrecap.com">support@inboxrecap.com</a></p>
          <p>Phone: (617) 454-4971</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <a href="https://instagram.com/inboxrecap" target="_blank" rel="noopener noreferrer" className="social-icon">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">TW</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">LI</a>
          <p className="personal">Made by <a href="https://tremanus.github.io" target="_blank" rel="noopener noreferrer">Biya</a></p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} InboxRecap. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
