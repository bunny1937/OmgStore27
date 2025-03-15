import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../db/Firebase";
import toast from "react-hot-toast";
import "./Wishlist.css";
import { auth } from "../../db/Firebase"; // Ensure correct Firebase import
import UserContext from "../../Auth/UserContext";
import cartContext from "../context/cartContext";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchWishlistItems(user.uid);
      } else {
        setUserId(null);
        setWishlistItems([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWishlistItems = async (uid) => {
    try {
      setLoading(true);
      const wishlistRef = collection(db, "users", uid, "wishlist");
      const querySnapshot = await getDocs(wishlistRef);

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setWishlistItems(items);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      toast.error("Failed to load wishlist items");
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (item) => {
    if (!userId) {
      toast.error("Please sign in to add items to your wishlist");
      return;
    }

    try {
      const itemKey = `${item.id}-${item.size || "default"}`;
      const wishlistRef = doc(db, "users", userId, "wishlist", itemKey);

      const docSnap = await getDoc(wishlistRef);
      if (docSnap.exists()) {
        toast.error("This item is already in your wishlist");
        return;
      }

      const wishlistItem = {
        id: item.id,
        Img: item.Img,
        Name: item.Name,
        Category: item.Category,
        discountedPrice: item.discountedPrice,
        price: item.price,
        size: item.size || "default",
        color: item.color || "",
        quantity: item.quantity || 1,
        addedAt: new Date(),
      };

      await setDoc(wishlistRef, wishlistItem);
      setWishlistItems([...wishlistItems, { ...wishlistItem, id: itemKey }]);
      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add item to wishlist");
    }
  };

  const removeFromWishlist = async (itemId, size = "default") => {
    if (!userId) return;

    try {
      const itemKey = `${itemId}-${size}`;
      await deleteDoc(doc(db, "users", userId, "wishlist", itemKey));
      setWishlistItems((prevWishlist) =>
        prevWishlist.filter(
          (wishlistItem) =>
            wishlistItem.id !== itemId || wishlistItem.size !== size
        )
      );

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
    }
  };

  const isInWishlist = (itemId, size = "default") => {
    return wishlistItems.some(
      (item) => item.id === itemId && item.size === size
    );
  };

  const clearWishlist = async () => {
    if (!userId) return;

    try {
      const wishlistRef = collection(db, "users", userId, "wishlist");
      const querySnapshot = await getDocs(wishlistRef);

      querySnapshot.docs.forEach(async (document) => {
        await deleteDoc(doc(db, "users", userId, "wishlist", document.id));
      });

      setWishlistItems([]);
      toast.success("Wishlist cleared");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};

const WishlistPage = () => {
  const { wishlistItems, loading, removeFromWishlist, saveCartToFirebase } =
    useWishlist();
  const [sortBy, setSortBy] = useState("date");
  const navigate = useNavigate();
  const { dispatch, cartItems } = useContext(cartContext);
  const { user } = useContext(UserContext); // User context
  const { fetchCartFromFirestore } = useContext(cartContext);

  const getSortedItems = () => {
    if (sortBy === "date") {
      return [...wishlistItems].sort(
        (a, b) => b.addedAt?.toDate?.() - a.addedAt?.toDate?.() || 0
      );
    } else if (sortBy === "price-low") {
      return [...wishlistItems].sort(
        (a, b) => (a.discountedPrice || 0) - (b.discountedPrice || 0)
      );
    } else if (sortBy === "price-high") {
      return [...wishlistItems].sort(
        (a, b) => (b.discountedPrice || 0) - (a.discountedPrice || 0)
      );
    }
    return wishlistItems;
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (item) => {
    if (!user?.uid) return;

    try {
      const uniqueItemId = `${item.id}-${item.size}`;
      const cartDocRef = doc(db, "users", user.uid, "Cart", uniqueItemId);

      // Check if the item already exists in the Cart
      const cartDocSnapshot = await getDoc(cartDocRef);

      if (cartDocSnapshot.exists()) {
        console.log("Item already in Firestore. Updating quantity...");
        const existingData = cartDocSnapshot.data();
        const updatedQuantity = existingData.quantity + (item.quantity || 1);

        await updateDoc(cartDocRef, { quantity: updatedQuantity });
        console.log("Updated quantity in Firestore:", updatedQuantity);
      } else {
        console.log("Item NOT in Firestore. Adding new item...");
        await setDoc(cartDocRef, { ...item, quantity: 1 });
        console.log("Item added to Firestore:", uniqueItemId);
      }

      // ✅ Remove the item from the wishlist in Firestore
      const wishlistRef = doc(db, "users", user.uid, "wishlist", uniqueItemId);
      await deleteDoc(wishlistRef);
      console.log("Item removed from wishlist in Firestore:", uniqueItemId);

      // ✅ Update local state: fetch updated cart and wishlist
      const updatedCart = await fetchCartFromFirestore(user.uid);
      dispatch({ type: "SET_CART_ITEMS", payload: updatedCart });

      // ✅ Update wishlist state
      removeFromWishlist(item.id, item.size);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return <div className="wishlist-loading">Loading your wishlist...</div>;
  }

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-title">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">🕒</div>
          <h2>Your wishlist is empty</h2>
          <p>Save items to watch for later or buy when you're ready</p>
          <button
            className="wishlist-shop-button"
            onClick={() => navigate("/shop")}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="wishlist-controls">
            <div className="wishlist-count">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </div>
            <div className="wishlist-sort">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Date Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="wishlist-grid">
            {getSortedItems().map((item) => (
              <div className="wishlist-item" key={`${item.id}-${item.size}`}>
                <div className="wishlist-item-remove">
                  <button
                    onClick={() => removeFromWishlist(item.id, item.size)}
                  >
                    ✕
                  </button>
                </div>

                <div
                  className="wishlist-item-image"
                  onClick={() => handleProductClick(item.id)}
                >
                  <img src={item.Img} alt={item.Name} />
                </div>

                <div className="wishlist-item-details">
                  <h3 className="wishlist-item-name">{item.Name}</h3>

                  <div className="wishlist-item-info">
                    {item.size && item.size !== "default" && (
                      <span className="wishlist-item-size">
                        Size: {item.size}
                      </span>
                    )}
                    {item.color && (
                      <span className="wishlist-item-color">
                        Color: {item.color}
                      </span>
                    )}
                  </div>

                  <div className="wishlist-item-price">
                    <span className="current-price">
                      ₹{item.discountedPrice.toLocaleString()}
                    </span>
                    {item.price > item.discountedPrice && (
                      <span className="original-price">
                        ₹{item.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="wishlist-item-actions">
                    <button
                      className="wishlist-add-to-cart"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;
