import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <>
      <footer className="footer-distributed">
        <div className="footer-left">
          <h3>
            Company<span>logo</span>
          </h3>

          <h3 className="footer-links">
            <p className="link-1">Home</p>
            <p>Blog</p>
            <p>Pricing</p>
            <p>About</p>
            <p>Faq</p>
            <p>Contact</p>
          </h3>

          <p className="footer-company-name">Company Name © 2015</p>
        </div>

        <div className="footer-center">
          <div>
            <i className="fa fa-map-marker"></i>
            <p>
              <span>444 S. Cedros Ave</span> Solana Beach, California
            </p>
          </div>

          <div>
            <i className="fa fa-phone"></i>
            <p>+1.555.555.5555</p>
          </div>

          <div>
            <i className="fa fa-envelope"></i>
            <p>
              <a href="mailto:support@company.com">support@company.com</a>
            </p>
          </div>
        </div>

        <div className="footer-right">
          <p className="footer-company-about">
            <span>About the company</span>
            Lorem ipsum dolor sit amet, consectateur adispicing elit. Fusce
            euismod convallis velit, eu auctor lacus vehicula sit amet.
          </p>

          <div className="footer-icons">
            <p>
              <i className="fa fa-facebook"></i>
            </p>
            <p>
              <i className="fa fa-twitter"></i>
            </p>
            <p>
              <i className="fa fa-linkedin"></i>
            </p>
            <p>
              <i className="fa fa-github"></i>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
