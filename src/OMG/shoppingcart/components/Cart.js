import React, { useContext, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import cartContext from "../context/cartContext";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore, auth } from "../../db/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import "./Cart.css";

const Cart = () => {
  const {
    toggleCart,
    removeItem,
    incrementItem,
    decrementItem,
    isCartOpen,
    cartItems,
    clearCart,
    dispatch,
  } = useContext(cartContext);
  const cartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart items when user is authenticated
  useEffect(() => {
    // Animation for when the cart appears
    gsap.fromTo(
      cartRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  // Function to fetch cart items
  useEffect(() => {
    const fetchCartItems = async (userId) => {
      try {
        setIsLoading(true); // Start loading
        const userId = auth.currentUser?.uid;
        if (!userId || cartItems.length > 0) {
          setIsLoading(false);
          return; // Exit if no userId or cart already populated
        }

        const userDoc = await getDoc(doc(firestore, "users", userId));
        const sanitizedId = userDoc.data()?.sanitizedId;

        if (!sanitizedId) {
          setIsLoading(false);
          return; // Exit if no sanitized ID found
        }

        const cartCollection = collection(
          firestore,
          "users",
          sanitizedId,
          "Cart"
        );
        const cartSnapshot = await getDocs(cartCollection);

        const items = cartSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        dispatch({ type: "SET_CART_ITEMS", payload: items });
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast.error(error.message);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCartItems(user.uid);
      } else {
        dispatch({ type: "SET_CART_ITEMS", payload: [] });
      }
    });

    return () => unsubscribe();
  }, [dispatch, cartItems.length]);

  const cartQuantity = cartItems ? cartItems.length : 0;
  const cartTotal = cartItems
    ? cartItems
        .map((item) => item.price * item.quantity)
        .reduce((prevValue, currValue) => prevValue + currValue, 0)
    : 0;

  if (isLoading) {
    return <div>Loading your cart...</div>;
  }

  return (
    <>
      {isCartOpen && (
        <div id="cart" ref={cartRef}>
          <div className="cart_content">
            <div className="cart_head">
              <h2>
                Cart <small>({cartQuantity})</small>
              </h2>
              <div
                title="Close"
                className="close_btn"
                onClick={() => dispatch({ type: "TOGGLE_CART" })}
              >
                <span>&times;</span>
              </div>
            </div>
            <div className="cart_body">
              {cartItems.length === 0 ? (
                <h2>Cart is empty</h2>
              ) : (
                cartItems.map((item) => {
                  const {
                    id,
                    Img,
                    Category,
                    Name,
                    price,
                    quantity,
                    uniqueItemId,
                    size,
                  } = item;
                  const itemTotal = price * quantity;

                  return (
                    <div className="cart_items" key={uniqueItemId}>
                      <figure className="cart_items_img">
                        <img src={Img} alt="product-img" />
                      </figure>
                      <div className="cart_items_info">
                        <h4>{Name}</h4>
                        <h4>{Category}</h4>
                        <h3 className="size">Size:{size || "N/A"}</h3>
                        <h3 className="price">
                          ₹ {itemTotal.toLocaleString()} ||
                          <span> ₹ {price}</span>
                        </h3>
                        <div className="cart_items_quantity">
                          <span onClick={() => decrementItem(id, size)}>
                            &#8722;
                          </span>
                          <b>{quantity}</b>
                          <span onClick={() => incrementItem(id, size)}>
                            &#43;
                          </span>
                        </div>
                      </div>

                      <button onClick={() => removeItem(id, size || "N/A")}>
                        <span style={{ color: "#000", fontSize: "10pt" }}>
                          &times;
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="cart_foot">
              <h3>
                <small>Total:</small>
                <b>₹ {cartTotal.toLocaleString()}</b>
              </h3>
              {/* Clear Cart Button */}
              <button
                type="button"
                className="clear_cart_btn"
                onClick={clearCart} // Trigger clearCart function here
                disabled={cartQuantity === 0}
              >
                Clear All
              </button>
              <Link to={"/Checkoutold"}>
                <button
                  type="button"
                  className="checkout_btn"
                  disabled={cartQuantity === 0}
                >
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
