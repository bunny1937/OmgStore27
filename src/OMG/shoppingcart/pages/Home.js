import React, { useState, useEffect } from "react";
import ReactSlider from "react-slider";
import ProductsCard from "../components/ProductsCard";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { firebaseApp } from "../../db/Firebase";
import SkeletonCard from "./Skeleton";

const Home = () => {
  const [products, setProducts] = useState([]);
  const firestore = getFirestore(firebaseApp);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("none");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const availableGenders = ["Male", "female", "unisex"];
  const [featuredProductIds, setFeaturedProductIds] = useState([]);
  const [bestSellingProductIds, setBestSellingProductIds] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        productsData.forEach((product) => {
          if (
            !product.Gender ||
            !product.discountedPrice ||
            !product.Category ||
            !product.size
          ) {
            console.log("Product with missing data:", product.id, product);
          }
        });
        setProducts(productsData);
        setFilteredProducts(productsData);
        try {
          const featuredConfigRef = doc(
            firestore,
            "Configuration",
            "featuredProducts"
          );
          const featuredConfigSnap = await getDoc(featuredConfigRef);

          if (featuredConfigSnap.exists()) {
            setFeaturedProductIds(featuredConfigSnap.data().order || []);
          }
        } catch (configError) {
          console.error("Error fetching featured configuration:", configError);
        }
        try {
          const bestSellingConfigRef = doc(
            firestore,
            "Configuration",
            "bestSellingProducts"
          );
          const bestSellingConfigSnap = await getDoc(bestSellingConfigRef);

          if (bestSellingConfigSnap.exists()) {
            setBestSellingProductIds(bestSellingConfigSnap.data().order || []);
          }
        } catch (configError) {
          console.error(
            "Error fetching best selling configuration:",
            configError
          );
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [firestore]);

  // Filter and Sort Products Dynamically
  useEffect(() => {
    console.log("Filtering products...");

    let filtered = products.filter((product) => {
      const matchesGender =
        selectedGenders.length === 0 ||
        selectedGenders.includes(product.Gender);

      const matchesSize =
        selectedSizes.length === 0 ||
        product.size?.some((size) => selectedSizes.includes(size));

      const matchesPrice =
        product.discountedPrice >= priceRange[0] &&
        product.discountedPrice <= priceRange[1];

      const matchesCategory =
        selectedCategory === "" || product.Category === selectedCategory;

      return matchesGender && matchesSize && matchesPrice && matchesCategory;
    });

    // Apply sorting
    if (sortBy !== "none") {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "lowToHigh":
            return a.discountedPrice - b.discountedPrice;
          case "highToLow":
            return b.discountedPrice - a.discountedPrice;
          case "featured":
            // Get indices in the featured list
            const aIndex = featuredProductIds.indexOf(a.id);
            const bIndex = featuredProductIds.indexOf(b.id);

            // If both are featured, sort by order in featuredProductIds
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            }

            // If only one is featured
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;

            // If neither is featured
            return 0;
          case "bestSelling":
            const aIndexBest = bestSellingProductIds.indexOf(a.id);
            const bIndexBest = bestSellingProductIds.indexOf(b.id);

            if (aIndexBest !== -1 && bIndexBest !== -1) {
              return aIndexBest - bIndexBest;
            }

            // If only one is in best selling list
            if (aIndexBest !== -1) return -1;
            if (bIndexBest !== -1) return 1;

            // If neither is in best selling list
            return 0;
          default:
            return 0;
        }
      });
    }

    setFilteredProducts(filtered);
    console.log(
      `Products before filtering: ${products.length}, after filtering: ${filtered.length}`
    );
  }, [
    products,
    selectedGenders,
    selectedSizes,
    priceRange,
    selectedCategory,
    sortBy,
    featuredProductIds,
    bestSellingProductIds,
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

  console.log(products);
  return (
    <>
      <section id="home">
        {error && <p className="error-message">{error}</p>}
        <div className="home-container">
          <div className="filter-sort-section">
            <button className="filter-button" onClick={handleToggleFilter}>
              Filters
            </button>
            <div className="sort-container">
              <label htmlFor="sort-select">Sort By:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="none">Default</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="bestSelling">Best Selling</option>
                <option value="featured">Featured</option>
              </select>
            </div>
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
    </>
  );
};

export default Home;
