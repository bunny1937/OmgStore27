import "./Mainpage1.css";
import Picture3 from "../shoppingcart/components/pages/photos/parallax/man-1283231_640.jpg";
import Picture4 from "../shoppingcart/components/pages/photos/parallax/man-poses-in-light-colored-overcoat.jpg";
import Picture5 from "../shoppingcart/components/pages/photos/parallax/pexels-olenagoldman-1021693.jpg";
import Picture6 from "../shoppingcart/components/pages/photos/parallax/fashion-3080626_640.jpg";
import Picture7 from "../shoppingcart/components/pages/photos/parallax/woman-1721065_640.jpg";
import Picture8 from "../shoppingcart/components/pages/photos/parallax/pexels-rfera-432059.jpg";
import Picture9 from "../shoppingcart/components/pages/photos/parallax/man-in-white-and-light-tan-outfit.jpg";
import { Link } from "react-router-dom";
const Mainpage1 = () => {
  return (
    <div className="landing-wrapper">
      <main className="landing-container1">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Divine</span>
              <span className="title-line">Essence</span>
            </h1>

            <div className="hero-taglines">
              <p>
                Elevate your space with our premium collection of minimalist
                designs.
              </p>
              <p>
                Discover tranquility, faith and inner peace through our
                spiritual treasures.
              </p>
            </div>
            <Link to={"/Home"}>
              <button className="cta-button">Explore Collection</button>
            </Link>
          </div>

          <div className="hero-visual">
            <div className="image-layout">
              <div className="image-container featured-image">
                <div className="image-accent accent-1"></div>
                <img
                  src={Picture3}
                  alt="Gallery item"
                  className="product-image"
                />
              </div>

              <div className="image-container secondary-image image-1">
                <div className="image-accent accent-2"></div>
                <img
                  src={Picture4}
                  alt="Gallery item"
                  className="product-image"
                />
              </div>

              <div className="image-container secondary-image image-2">
                <div className="image-accent accent-3"></div>
                <img
                  src={Picture6}
                  alt="Gallery item"
                  className="product-image"
                />
              </div>

              <div className="image-container secondary-image image-3">
                <div className="image-accent accent-4"></div>
                <img
                  src={Picture5}
                  alt="Gallery item"
                  className="product-image"
                />
              </div>
            </div>

            <div className="decorative-elements">
              <div className="deco-element el-1"></div>
              <div className="deco-element el-2"></div>
              <div className="deco-element el-3"></div>
              <div className="deco-element el-4"></div>
              <div className="deco-element el-5"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Mainpage1;
