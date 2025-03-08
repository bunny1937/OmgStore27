import React, {
  createContext,
  useState,
  useReducer,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { firestore, auth } from "../../db/Firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  writeBatch,
  getDocs,
  collection,
  deleteDoc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import cartReducer from "./cartReducer";
import UserContext from "../../Auth/UserContext";

const cartContext = createContext({
  state: null,
  dispatch: () => null,
});
const initialState = {
  isCartOpen: false,
  cartItems: [],
  cartQuantity: 0,
  isLoading: true,
  buyNowItem: null,
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useContext(UserContext);

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const cartQuantity = state.cartItems?.length || 0;

  const initCart = useCallback(async () => {
    if (!user?.uid) return;

    const userCartRef = collection(firestore, "users", user.uid, "Cart");

    try {
      // Fetch initial data from Firestore
      const snapshot = await getDocs(userCartRef);
      const initialCartItems = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uniqueItemId: doc.id, // Add unique ID for UI mapping
      }));

      // Set the initial state
      dispatch({
        type: "SET_CART_ITEMS",
        payload: initialCartItems,
      });

      // Start listening for real-time updates
      const unsubscribe = onSnapshot(userCartRef, (snapshot) => {
        const cartItems = snapshot.docs.map((doc) => ({
          ...doc.data(),
          uniqueItemId: doc.id,
        }));

        dispatch({
          type: "SET_CART_ITEMS",
          payload: cartItems,
        });
        dispatch({ type: "SET_LOADING", payload: false });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing cart:", error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      initCart();
    }
  }, [user, initCart]);

  const addItem = async (item) => {
    if (!user?.uid) return;

    try {
      // Validate item properties
      const requiredFields = [
        "id",
        "Img",
        "Name",
        "discountedPrice",
        "quantity",
        "Category",
        "Gender",
        "size",
      ];
      const hasAllFields = requiredFields.every((field) => item[field]);

      if (!hasAllFields) {
        console.error("Invalid item:", item);
        return;
      }

      // Generate a unique identifier for the item using ID and size
      const uniqueItemId = `${item.id}-${item.size}`;

      const itemToAdd = {
        ...item,
        uniqueItemId,
      };

      const cartDocRef = doc(
        firestore,
        "users",
        user.uid,
        "Cart",
        uniqueItemId
      );

      // Check if the item exists in Firestore
      const cartDocSnapshot = await getDoc(cartDocRef);

      if (cartDocSnapshot.exists()) {
        // Fetch the latest quantity from Firestore
        const existingData = cartDocSnapshot.data();
        const updatedQuantity = existingData.quantity + item.quantity;

        // Update the item's quantity in Firestore
        await updateDoc(cartDocRef, { quantity: updatedQuantity });
      } else {
        // If item doesn't exist, add it to Firestore
        await setDoc(cartDocRef, itemToAdd);
      }

      // Refresh the cart by fetching the latest data from Firestore
      const updatedCart = await fetchCartFromFirestore(user.uid);

      // Update the local state with the latest data
      dispatch({ type: "SET_CART", payload: updatedCart });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const fetchCartFromFirestore = async (userId) => {
    try {
      const cartCollectionRef = collection(firestore, "users", userId, "Cart");
      const cartSnapshot = await getDocs(cartCollectionRef);

      return cartSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error fetching cart:", error);
      return [];
    }
  };

  const incrementItem = async (itemId, size) => {
    if (!user?.uid) return;

    const uniqueItemId = `${itemId}-${size}`;
    const itemDocRef = doc(firestore, "users", user.uid, "Cart", uniqueItemId);

    try {
      // Perform the update in Firestore first
      await runTransaction(firestore, async (transaction) => {
        const itemDoc = await transaction.get(itemDocRef);
        if (!itemDoc.exists()) {
          throw new Error("Document does not exist!");
        }

        const newQuantity = (itemDoc.data().quantity || 0) + 1;
        transaction.update(itemDocRef, { quantity: newQuantity });
      });

      // Dispatch the increment action
      dispatch({
        type: "INCREMENT",
        payload: {
          itemId,
          size,
          uniqueItemId,
        },
      });
    } catch (error) {
      console.error("Error incrementing item:", error);
      // Optionally, refresh the cart to ensure consistency
      initCart();
    }
  };

  // Similar approach for decrementItem
  const decrementItem = async (itemId, size) => {
    if (!user?.uid) return;

    const uniqueItemId = `${itemId}-${size}`;
    const itemDocRef = doc(firestore, "users", user.uid, "Cart", uniqueItemId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const itemDoc = await transaction.get(itemDocRef);
        if (!itemDoc.exists()) {
          throw new Error("Document does not exist!");
        }

        const currentQuantity = itemDoc.data().quantity || 0;

        if (currentQuantity <= 1) {
          // If quantity is 1 or less, delete the document
          transaction.delete(itemDocRef);
        } else {
          // Otherwise, decrement the quantity
          transaction.update(itemDocRef, {
            quantity: currentQuantity - 1,
          });
        }
      });

      // Dispatch the decrement action
      dispatch({
        type: "DECREMENT",
        payload: {
          itemId,
          size,
          uniqueItemId,
        },
      });
    } catch (error) {
      console.error("Error decrementing item:", error);
      // Optionally, refresh the cart to ensure consistency
      initCart();
    }
  };

  const removeItem = async (itemId, size) => {
    try {
      const userId = auth.currentUser.uid;
      // Use the unique item identifier when referencing Firestore
      const uniqueItemId = `${itemId}-${size}`;
      const cartDocRef = doc(firestore, "users", userId, "Cart", uniqueItemId);

      // Remove the specific document from Firestore
      await deleteDoc(cartDocRef);

      // Dispatch the remove action
      dispatch({
        type: "REMOVE_FROM_CART",
        payload: { itemId, size },
      });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const clearCart = async () => {
    if (!user?.uid) return;

    try {
      const batch = writeBatch(firestore);
      const cartCollection = collection(firestore, "users", user.uid, "Cart");
      const cartSnapshot = await getDocs(cartCollection);

      // Only attempt to delete if there are documents
      if (!cartSnapshot.empty) {
        cartSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      // Update local state
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const setBuyNowItem = (item) => {
    dispatch({ type: "SET_BUY_NOW_ITEM", payload: item });
  };

  const incrementBuyNowItem = () => {
    dispatch({ type: "INCREMENT_BUY_NOW" });
  };

  const decrementBuyNowItem = () => {
    dispatch({ type: "DECREMENT_BUY_NOW" });
  };

  const removeBuyNowItem = () => {
    dispatch({ type: "REMOVE_BUY_NOW" });
  };

  const values = {
    ...state,
    initCart,
    dispatch,
    addItem,
    removeItem,
    incrementItem,
    cartQuantity,
    isCartOpen: state.isCartOpen,
    cartItems: state.cartItems,
    decrementItem,
    toggleCart,
    clearCart,
    setBuyNowItem,
    buyNowItem: state.buyNowItem,
    incrementBuyNowItem,
    decrementBuyNowItem,
    removeBuyNowItem,
  };

  return <cartContext.Provider value={values}>{children}</cartContext.Provider>;
};

export default cartContext;
export { CartProvider };
