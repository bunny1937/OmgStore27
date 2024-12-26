import { firestore, db } from "../../db/Firebase";
import {
  doc,
  getDocs,
  writeBatch,
  collection,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

// Fetch data from Firestore for the logged-in user
const fetchFirestoreData = async (userId) => {
  try {
    console.log(`Fetching Firestore data for user: ${userId}`);
    const cartRef = collection(firestore, "users", userId, "Cart");
    const favoritesRef = collection(firestore, "users", userId, "Favorites");

    const [cartSnapshot, favoriteSnapshot] = await Promise.all([
      getDocs(cartRef),
      getDocs(favoritesRef),
    ]);

    const firestoreCart = cartSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const firestoreFavorites = favoriteSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched Firestore Cart:", firestoreCart);
    console.log("Fetched Firestore Favorites:", firestoreFavorites);

    return { firestoreCart, firestoreFavorites };
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
    throw error;
  }
};

// Merge local storage data with Firestore data
const mergeData = (localData, firestoreData) => {
  console.log("Merging data...");
  const merged = [...firestoreData];
  localData.forEach((localItem) => {
    const exists = merged.some((item) => item.id === localItem.id);
    if (!exists) {
      merged.push(localItem);
    }
  });
  console.log("Merged data:", merged);
  return merged;
};

// Update Firestore with merged data
const updateFirestore = async (userId, cartData, favoritesData) => {
  try {
    console.log("Updating Firestore...");
    const batch = writeBatch(firestore);

    cartData.forEach((item) => {
      const cartDocRef = doc(firestore, "users", userId, "Cart", item.id);
      batch.set(cartDocRef, item);
    });

    favoritesData.forEach((item) => {
      const favoriteDocRef = doc(
        firestore,
        "users",
        userId,
        "Favorites",
        item.id
      );
      batch.set(favoriteDocRef, item);
    });

    await batch.commit();
    console.log("Firestore updated successfully.");
  } catch (error) {
    console.error("Error updating Firestore:", error);
    throw error;
  }
};

// Sync local storage data to Firestore on login
export const initUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDocRef);
    if (!userSnapshot.exists()) {
      // Initialize user data if it doesn't exist
      await setDoc(userDocRef, {
        favorites: [],
        cart: [],
        // Add other initial user data here
      });
      console.log("User data initialized for:", userId);
    }
  } catch (error) {
    console.error("Error initializing user data:", error);
  }
};

// Listen to Firestore updates for a user
export const listenToFirestore = (userId) => {
  const userDocRef = doc(db, "users", userId);

  const unsubscribe = onSnapshot(userDocRef, (doc) => {
    console.log("User data updated:", doc.data());
    // Update state or local storage with the new data if needed
  });

  return unsubscribe;
};
