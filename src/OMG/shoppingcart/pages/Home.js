import React, { useState, useEffect } from "react";
import ReactSlider from "react-slider";
import ProductsCard from "../components/ProductsCard";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../../db/Firebase";
import Cart from "../components/Cart";
import SkeletonCard from "./Skeleton";

const Home = () => {
  const [products, setProducts] = useState([]);
  const firestore = getFirestore(firebaseApp);

  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("none");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const availableGenders = ["Male", "Female", "Unisex"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [firestore]);

  // Filter Products Dynamically
  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesGender =
        selectedGenders.length === 0 ||
        selectedGenders.includes(product.Gender);

      const matchesSize =
        selectedSizes.length === 0 ||
        product.size?.some((size) => selectedSizes.includes(size));

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      const matchesCategory =
        selectedCategory === "" || product.Category === selectedCategory;

      return matchesGender && matchesSize && matchesPrice && matchesCategory;
    });

    // Apply sorting
    if (sortBy === "priceLowToHigh") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighToLow") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [
    products,
    selectedGenders,
    selectedSizes,
    priceRange,
    selectedCategory,
    sortBy,
  ]);

  // Handle Gender Filter Change
  const handleGenderFilterChange = (value, checked) => {
    setSelectedGenders((prev) =>
      checked ? [...prev, value] : prev.filter((gender) => gender !== value)
    );
  };

  // Handle Size Filter Change
  const handleSizeFilterChange = (value, checked) => {
    setSelectedSizes((prev) =>
      checked ? [...prev, value] : prev.filter((size) => size !== value)
    );
  };

  const handleToggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleClear = () => {
    setSortBy("none");
    setPriceRange([0, 2000]);
    setSelectedCategory("");
    setSelectedGenders([]);
    setSelectedSizes([]);
  };

  const handleApply = () => {
    setIsFilterOpen(false);
  };

  return (
    <>
      <section id="home">
        <div className="home-container">
          <div className="filter-section">
            <button onClick={handleToggleFilter}>Filters</button>
          </div>
          <div className={`filter-container ${isFilterOpen ? "open" : ""}`}>
            <h2>Filters</h2>
            <button className="close" onClick={handleToggleFilter}>
              &times;
            </button>
            <div className="price-range-slider">
              <label>Price Range:</label>
              <ReactSlider
                className="horizontal-slider"
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                min={0}
                max={2000}
                value={priceRange}
                onChange={(values) => setPriceRange(values)}
                step={10}
              />
              <div className="price-range-values">
                <span>₹{priceRange[0]}</span> - <span>₹{priceRange[1]}</span>
              </div>
            </div>
            {/* Category Filter */}
            <label>
              Categories:
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {[...new Set(products.map((p) => p.Category))].map(
                  (category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>
            </label>

            {/* Gender Filter */}
            <div className="filter-group">
              <h4>Gender</h4>
              <div className="filter-options">
                {availableGenders.map((gender) => (
                  <label key={gender} className="filter-label">
                    <input
                      type="checkbox"
                      value={gender}
                      checked={selectedGenders.includes(gender)}
                      onChange={(e) =>
                        handleGenderFilterChange(
                          e.target.value,
                          e.target.checked
                        )
                      }
                    />
                    {gender}
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="filter-group">
              <h4>Sizes</h4>
              <div className="filter-options">
                {availableSizes.map((size) => (
                  <label key={size} className="filter-label">
                    <input
                      type="checkbox"
                      value={size}
                      checked={selectedSizes.includes(size)}
                      onChange={(e) =>
                        handleSizeFilterChange(e.target.value, e.target.checked)
                      }
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <br />
            <button className="clear-btn" onClick={handleClear}>
              Clear
            </button>
            <button className="apply-btn" onClick={handleApply}>
              Apply
            </button>
          </div>
          <div className="home_content">
            {isLoading ? (
              [...Array(24)].map((_, index) => <SkeletonCard key={index} />)
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductsCard
                  key={`${product.id}_${index}`}
                  id={product.id}
                  {...product}
                />
              ))
            ) : (
              <div className="empty-state">
                <h3>Oops! No products found. Stocking soon!</h3>
              </div>
            )}
          </div>
        </div>
      </section>
      <Cart />
    </>
  );
};

export default Home;
