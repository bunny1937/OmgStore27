import { createContext, useState, useEffect } from "react";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch, // Correct method for Firestore batch operations
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FavouritesContext = createContext();

const FavouritesProvider = ({ children }) => {
  const [favouriteItems, setFavouriteItems] = useState([]);
  const [userId, setUserId] = useState(null); // Holds the user ID when authenticated
  const db = getFirestore();
  const auth = getAuth();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set user ID when authenticated
      } else {
        setUserId(null); // Reset when logged out
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [auth]);

  // Fetch favorites from Firestore
  useEffect(() => {
    if (userId) {
      const fetchFavourites = async () => {
        try {
          const favouritesCollection = collection(
            db,
            "users",
            userId,
            "Favourites"
          );
          const snapshot = await getDocs(favouritesCollection);
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFavouriteItems(items);
        } catch (error) {
          console.error("Error fetching favourites:", error);
        }
      };
      fetchFavourites();
    }
  }, [userId, db]);

  // Add a favourite item
  const addFavourite = async (item) => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    if (!item || !item.id || !item.size || !item.quantity) {
      console.error("Invalid item or missing size:", item);
      return;
    }

    const favouriteId = `${item.id}_${item.size}`; // Unique ID based on product ID and size
    const itemRef = doc(db, "users", userId, "Favourites", favouriteId);

    try {
      await setDoc(itemRef, item); // Save the item to Firestore
      setFavouriteItems((prev) => [...prev, { id: favouriteId, ...item }]); // Update state
      console.log("Item added to favourites:", item);
    } catch (error) {
      console.error("Error adding favourite item:", error);
    }
  };

  // Remove a single favourite item
  const removeFavouriteItem = async (id) => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const itemRef = doc(db, "users", userId, "Favourites", id);
      await deleteDoc(itemRef); // Remove from Firestore
      setFavouriteItems((prevItems) => prevItems.filter((i) => i.id !== id));
      console.log("Item removed from favourites:", id);
    } catch (error) {
      console.error("Error removing favourite item:", error);
    }
  };

  // Remove all favourites
  const removeAllFavourites = async () => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const favouritesCollection = collection(
        db,
        "users",
        userId,
        "Favourites"
      );
      const snapshot = await getDocs(favouritesCollection);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit(); // Commit batch delete
      setFavouriteItems([]); // Clear local state
      console.log("All favourites removed.");
    } catch (error) {
      console.error("Error removing all favourites:", error);
    }
  };

  return (
    <FavouritesContext.Provider
      value={{
        favouriteItems,
        addFavourite,
        removeFavouriteItem,
        removeAllFavourites,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

export { FavouritesProvider, FavouritesContext };
