import React from "react";
import "./Landingpage.css";
import ImgGrid from "./ImgGrid";
import { Link } from "react-router-dom";
function Landingpage() {
  return (
    <div className="container">
      {/* <header className="header">
        <div>
          <svg
            className="wavy-line"
            viewBox="0 0 1000 20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 10 Q 50 20, 100 10 Q 150 0, 200 10 Q 250 20, 300 10 Q 350 0, 400 10 Q 450 20, 500 10 Q 550 0, 600 10 Q 650 20, 700 10 Q 750 0, 800 10 Q 850 20, 900 10 Q 950 0, 1000 10"
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
            <path
              d="M0 15 Q 50 24, 100 15 Q 150 5, 200 15 Q 250 24, 300 15 Q 350 5, 400 15 Q 450 24, 500 15 Q 550 5, 600 15 Q 650 24, 700 15 Q 750 5, 800 15 Q 850 24, 900 15 Q 950 5, 1000 15"
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
          </svg>

          <br />
          <svg
            className="wavy-line-2"
            viewBox="0 0 1000 20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 10 Q 50 20, 100 10 Q 150 0, 200 10 Q 250 20, 300 10 Q 350 0, 400 10 Q 450 20, 500 10 Q 550 0, 600 10 Q 650 20, 700 10 Q 750 0, 800 10 Q 850 20, 900 10 Q 950 0, 1000 10"
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
            <path
              d="M0 15 Q 50 24, 100 15 Q 150 5, 200 15 Q 250 24, 300 15 Q 350 5, 400 15 Q 450 24, 500 15 Q 550 5, 600 15 Q 650 24, 700 15 Q 750 5, 800 15 Q 850 24, 900 15 Q 950 5, 1000 15"
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
          </svg>
        </div>
        {/* <svg className="circular-text" viewBox="0 0 100 100">
          <path
            id="curve"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="transparent"
          />
          <text>
            <textPath href="#curve">
              Lorem ipsum dolor sit amet consectetur
            </textPath>
          </text>
        </svg> 
      </header> */}

      <section className="main-page">
        <h1>Your ultimate Fashion Outfits</h1>
        <p>Modern Asthetics meets the Divine Faith meets the versitality</p>
        <button className="explore-btn">
          <Link to={"/Home"}>Lets Get Dressed</Link>
        </button>
      </section>

      <div className="landing-content">
        <div className="left-sidebar">
          <p>Asthetic</p>
          <p>Minimal</p>
          <p>Modern</p>
        </div>

        <ImgGrid />

        <div className="right-sidebar">
          <div className="right-sidebar-text">
            <p>Spiritual</p>
            <p>Devotion</p>
            <p>Faith</p>
          </div>
        </div>
      </div>

      {/* <footer className="footer">
        <svg className="circular-text" viewBox="0 0 100 100">
          <path
            id="curve2"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="transparent"
          />
          <text>
            <textPath href="#curve2">
              Lorem ipsum dolor sit amet consectetur
            </textPath>
          </text>
        </svg>
        <svg className="wavy-line" viewBox="0 0 200 20">
          <path
            d="M0 10 Q 20 20, 40 10 Q 60 0, 80 10 Q 100 20, 120 10 Q 140 0, 160 10 Q 180 20, 200 10"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <path
            d="M0 15 Q 20 25, 40 15 Q 60 5, 80 15 Q 100 25, 120 15 Q 140 5, 160 15 Q 180 25, 200 15"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
        </svg>
      </footer> */}
    </div>
  );
}

export default Landingpage;
