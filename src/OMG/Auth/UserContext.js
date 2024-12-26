import { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "../db/Firebase";

const auth = getAuth(firebaseApp); // Initialize the auth instance

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // For managing the initial loading state

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAdmin(firebaseUser.email === "admin@example.com"); // Set admin status
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false); // Authentication check complete
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      setUser(userCredential.user);
      setIsAdmin(userCredential.user.email === "admin@example.com"); // Set admin status
    } catch (error) {
      throw error; // Rethrow the error to be handled by the calling component
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isAdmin, signIn, setUser, setIsAdmin }}
    >
      {!loading && children}{" "}
      {/* Render children only after authentication state is determined */}
    </UserContext.Provider>
  );
};

export default UserContext;
