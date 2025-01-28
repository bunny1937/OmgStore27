import React, { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the newsletter signup
    console.log("Submitted email:", email);
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Shop</h3>
          <ul>
            <li>
              <a href="/category/Oversize">Oversize</a>
            </li>
            <li>
              <a href="/category/Hoodies">Hoodies</a>
            </li>
            <li>
              <a href="/products/Minimalist">Minimalist</a>
            </li>
            <li>
              <a href="products/Spiritual">Spiritual</a>
            </li>
            {/* <li>
              <a href="/sale">Sale</a>
            </li> */}
          </ul>
        </div>

        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul>
            <li>
              <a href="/shipping">Shipping</a>
            </li>
            <li>
              <a href="/Return-Refund">Returns</a>
            </li>
            <li>
              <a href="/returns">Orders</a>
            </li>
            <li>
              <a href="/size-guide">Size Guide</a>
            </li>
            {/* <li>
              <a href="/gift-cards">Gift Cards</a>
            </li> */}
          </ul>
        </div>
        <div className="footer-section">
          <div className="Connect-contact">
            <div className="Contact-footer">
              <h3>Service</h3>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
            </div>
            <div className="social-icons">
              <a href="https://facebook.com" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://pinterest.com" aria-label="Pinterest">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="newsletter-form">
          <h3>Feedback and Queries</h3>
          <div className="email-footer">
            <p>Email us:</p>
            <a
              href="mailto:omgadkar27@gmail.com?subject=Inquiry"
              style={{ color: "#ffcc00", textDecoration: "none" }}
            >
              omgadkar27@gmail.com
            </a>
          </div>
          <h3>Subscribe to our newsletter</h3>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <button type="submit">Subscribe</button>
          </div>
        </form>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 OMG Store. All rights reserved.</p>
        <ul className="footer-links">
          <li>
            <a href="/privacy">Privacy Policy</a>
          </li>
          <li>
            <a href="/terms">Terms of Service</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
