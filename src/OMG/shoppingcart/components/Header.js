import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartContext from "../context/cartContext";
import "./Navbar.css";
import { FavouritesContext } from "./FavoritesContext";
import UserContext from "../../Auth/UserContext";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../db/Firebase";
import logoblack from "./pages/photos/OMGstore.svg";
const Header = () => {
  const { user, isAdmin, setUser } = useContext(UserContext); // User context
  const { cartItems, dispatch } = useContext(cartContext); // Cart context
  const { favouriteItems } = useContext(FavouritesContext); // Favourites context
  const cartQuantity = cartItems ? cartItems.length : 0;
  const [click, setClick] = useState(false);
  const [favouriteQuantity, setFavouriteQuantity] = useState(0);
  const [dropdown, setDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [activeTab, setActiveTab] = useState("home"); // Default active tab

  const handleDropdown = () => {
    setDropdown(!dropdown);
  };

  const closeDropdown = (e) => {
    if (dropdown && !e.target.closest(".header-links")) {
      setDropdown(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.addEventListener("click", closeDropdown);

    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, [dropdown]);

  const logout = () => {
    localStorage.clear();
    setUser(null); // Clear the user context state
    navigate("/SignIn");
  };

  const handleSearchResultClick = (id) => {
    setSearchQuery(""); // Clear the search query
    setFilteredProducts([]);
    navigate(`/details/${id}`);
  };

  // Fetch products for the search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    document.addEventListener("click", closeDropdown);

    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, [dropdown]);
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filteredProducts = products.filter((product) =>
      product.Name?.toLowerCase().includes(query)
    );
    setFilteredProducts(filteredProducts);
    setShowResults(true);
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Products"));
        const categorySet = new Set();
        querySnapshot.forEach((doc) => {
          const { Category } = doc.data();
          if (Category) {
            categorySet.add(Category); // Add category to set to avoid duplicates
          }
        });
        setCategories([...categorySet]); // Convert set to array for rendering
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (favouriteItems) {
      setFavouriteQuantity(favouriteItems.length); // Update favourite quantity
    }
  }, [favouriteItems]);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  // Hide search results when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleToggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };
  return (
    <div className="navbar">
      <div className="navbar-container">
        {/* <button onClick={handleIconClick}>Open Component 1</button>
        {isComponent1Open && (
          <AniComponent1 onClose={() => setComponent1Open(false)} />
        )} */}
        <div className="header-links">
          <Link to={"/"} className="navbar-logo" onClick={closeMobileMenu}>
            <img src={logoblack} alt="hehe" />
          </Link>
        </div>

        <div className="menu-icon" onClick={handleClick}>
          <span style={{ color: "white" }}>
            <i className={click ? "fas fa-times" : "fas fa-bars"} />
          </span>
        </div>
        <span style={{ color: "white" }}>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <div className="header-links">
              <Link
                to={"/Home"}
                className="all-products"
                onClick={closeMobileMenu}
              >
                <p>All Products</p>
              </Link>
            </div>
            <div className="header-links">
              <Link
                to="/category/Oversize"
                className="dropdown-link"
                onClick={closeMobileMenu}
              >
                <p>Oversize</p>
              </Link>
            </div>
            <div className="header-links">
              <Link
                to="/category/Tshirts"
                className="dropdown-link"
                onClick={closeMobileMenu}
              >
                <p> Tshirts</p>
              </Link>
            </div>
            <div className="header-links">
              <Link
                to={"/Support"}
                className="navbar-links"
                onClick={closeMobileMenu}
              >
                <p> Contact</p>
              </Link>
            </div>
            <div className="header-links">
              <Link to={"/Favourites"} onClick={closeMobileMenu}>
                <p className="favourites-text">Favourites</p>
              </Link>
            </div>
            {/* <>
            <button onClick={() => setShowComponent1(true)}>Component1</button>
            {showComponent1 && (
              <AniComponent1 onClose={() => setShowComponent1(false)} />
            )}
          </> */}
          </ul>
        </span>
        <div className="search-join">
          <div
            className="header-links search-container"
            ref={searchContainerRef}
          >
            <i
              className="fa-solid fa-magnifying-glass search-icon"
              style={{ color: "#000000" }}
            ></i>
            <input
              type="text"
              className="nav-links search-input"
              placeholder="Find Product..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && showResults && filteredProducts.length > 0 && (
              <div className="search-results">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSearchResultClick(product.id)}
                    className="search-result-item"
                  >
                    <div className="product-details-container">
                      <div className="product-info">
                        <img
                          className="product-info-img"
                          src={product.ImgUrls[0]}
                        />
                        <h2>
                          <strong>{product.Name}</strong>
                          <br />
                          {product.price}/-
                        </h2>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && showResults && filteredProducts.length === 0 && (
              <p className="no-results">No products found</p>
            )}
          </div>
        </div>
        <div className="header-links user-container">
          <div onClick={handleDropdown} className="user-icon">
            {user && isAdmin}
          </div>

          {dropdown && (
            <ul className="dropdown-menu">
              {user ? (
                <>
                  <Link to={"/ProfileMenu"}>
                    <p>Profile</p>
                  </Link>
                  <p style={{ cursor: "pointer" }} onClick={logout}>
                    Logout
                  </p>
                </>
              ) : (
                <>
                  <li>
                    <Link to={"/SignUp"} onClick={() => setDropdown(false)}>
                      SignUp
                    </Link>
                  </li>
                  <li>
                    <Link to={"/SignIn"} onClick={() => setDropdown(false)}>
                      SignIn
                    </Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
        <div className="header-links">
          <Link to={"/Favourites"}>
            <div className="fav-icon">
              {favouriteQuantity >= 1 && (
                <span className="badge">{favouriteQuantity}</span>
              )}
            </div>
            <p className="favourites-text">Favourites</p>
          </Link>
        </div>

        <div className="header-links">
          <div title="Cart" className="cart_icon" onClick={handleToggleCart}>
            <div className="bag-icon" alt="bag-icon" />
            {cartQuantity >= 1 && <span className="badge">{cartQuantity}</span>}
          </div>
        </div>
        {isMobile && (
          <div className="mobile-bottom-nav">
            <Link
              to="/"
              className={`mobile-nav-item ${
                activeTab === "home" ? "active" : ""
              }`}
              onClick={() => setActiveTab("home")}
            >
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>

            <Link
              to="/Home"
              className={`mobile-nav-item ${
                activeTab === "products" ? "active" : ""
              }`}
              onClick={() => setActiveTab("products")}
            >
              <i class="fa-solid fa-shirt"></i> <span>Products</span>
            </Link>

            <div
              className={`mobile-nav-item ${
                activeTab === "cart" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("cart");
                handleToggleCart();
              }}
            >
              <div className="mobile-icon-container">
                <i className="fas fa-shopping-bag"></i>
                {cartQuantity > 0 && (
                  <span className="mobile-badge">{cartQuantity}</span>
                )}
              </div>
              <span>Cart</span>
            </div>

            <Link
              to="/ProfileMenu"
              className={`mobile-nav-item ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
