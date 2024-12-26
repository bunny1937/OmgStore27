import { useState, useContext } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseApp } from "../db/Firebase";
import UserContext from "./UserContext";
import SignUp from "./SignUp"; // Import SignUp component
import "./Popupsignin.css";
import toast from "react-hot-toast";
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

function Popupsignin({ onClose }) {
  const { setUser, setIsAdmin } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false); // State to toggle between SignIn and SignUp screens

  const toggleSignUp = () => {
    setShowSignUp(!showSignUp); // Toggle between SignIn and SignUp screens
  };

  const signin = async () => {
    if (email === "" || password === "") {
      return toast.error("Please fill all fields");
    }
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setUser(user);

      // Check if the user is an admin by fetching data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setEmail("");
      setPassword("");
      onClose();
      toast.success("Sign-In Successful!");
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      setUser(user);

      // Check if user already exists in Firestore, if not, add them
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          role: "user", // Default role if not already assigned
          createdAt: new Date(),
        });
      }

      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      toast.success("Google Sign-In Successful");
      onClose();
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-signin-container">
      {showSignUp ? (
        <SignUp
          onClose={() => {
            setShowSignUp(false); // Ensure SignUp popup closes
          }}
          onSignUpSuccess={() => {
            setShowSignUp(false); // Close SignUp modal
            alert("Signup successful! Please log in.");
          }}
        />
      ) : (
        <div className="signin-form">
          <div className="header">
            <h1 className="title">Sign In</h1>
          </div>
          <div className="input-field">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              className="input"
              placeholder="Email"
            />
          </div>
          <div className="input-field">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Password"
            />
          </div>
          <div className="button-field">
            <button onClick={signin} className="btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
          <div className="button-field">
            <button
              onClick={signInWithGoogle}
              className="btn google-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In with Google"}
            </button>
          </div>
          <div className="login-link">
            <h2 className="text">
              Don't have an account?{" "}
              <button className="link" onClick={toggleSignUp}>
                Sign Up
              </button>
            </h2>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
}

export default Popupsignin;
