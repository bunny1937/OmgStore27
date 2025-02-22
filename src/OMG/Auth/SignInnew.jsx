import { useNavigate, Link } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { setPersistence, browserSessionPersistence } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import { firebaseApp } from "../db/Firebase";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import UserContext from "./UserContext";
import "./SignInnew.css";
import signinimg from "../shoppingcart/components/pages/photos/parallax/pexels-olly-837140.jpg";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export function SignInnew({ open }) {
  const [signInMethod, setSignInMethod] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const { setUser, setIsAdmin } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // Ref for recaptcha container
  const recaptchaContainerRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  // Initialize reCAPTCHA verifier
  useEffect(() => {
    if (signInMethod === "phone" && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current,
          {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved
            },
            "expired-callback": () => {
              setError("reCAPTCHA expired. Please try again.");
            },
          }
        );
      } catch (error) {
        console.error("RecaptchaVerifier initialization error:", error);
        setError(
          "Failed to initialize phone authentication. Please try again."
        );
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [signInMethod]);

  const startPhoneVerification = async () => {
    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA not initialized");
      }

      const formattedPhoneNumber = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmation);
      setShowVerificationInput(true);
      toast.success("Verification code sent!");
    } catch (error) {
      console.error("Phone verification error:", error);
      toast.error(error.message);
      setError(error.message);

      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneNumber = async () => {
    if (!verificationCode) {
      toast.error("Please enter verification code");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          createdAt: new Date(),
        });
      }

      const userData = userDoc.exists() ? userDoc.data() : {};
      if (userData.role === "admin") {
        setIsAdmin(true);
        toast.success("Welcome back, Admin!");
        navigate("/AdminDash");
      } else {
        setIsAdmin(false);
        toast.success("Welcome back!");
        navigate("/Home");
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid verification code");
      setError("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    if (email === "" || password === "") {
      toast.error("Please fill all fields");
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
      localStorage.setItem("user", JSON.stringify(user)); // Persist user data
      // Check if the user is an admin by fetching data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data from Firestore:", userData);

        if (userData.role === "admin") {
          setIsAdmin(true);
          toast.success("Welcome, Admin!"); // Success message for Admin
          navigate("/AdminDash");
        } else {
          setIsAdmin(false);
          toast.success("Welcome!"); // Success message for regular user
          navigate("/Home");
        }
      } else {
        setIsAdmin(false);
        toast.success("Welcome!"); // Default success message
        navigate("/Home");
      }
    } catch (error) {
      toast.error(error.message); // Show error message
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Use session persistence for better handling across sessions
      await setPersistence(auth, browserSessionPersistence);

      // Trigger sign-in flow
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Set the user in context and localStorage
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      // Check Firestore for existing user data
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // If user doesn't exist, create a new Firestore document
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          firstName: "",
          lastName: "",
          phoneNumber: "",
          createdAt: new Date(),
        });
      }
      toast.success("Successfully signed in with Google!");
      navigate("/Home"); // Navigate after successful login
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast.error("Google sign-in failed: " + error.message); // Error handling for Google sign-in
      // User-Friendly Error Messages
      switch (error.code) {
        case "auth/network-request-failed":
          alert(
            "Network error occurred while trying to sign in. Please check your internet connection and try again."
          );
          break;

        case "auth/popup-closed-by-user":
          alert(
            "It seems like you closed the sign-in popup before completing the process. Please try again."
          );
          break;

        case "auth/cancelled-popup-request":
          alert(
            "Another sign-in process was initiated before the previous one completed. Please wait and try again."
          );
          break;

        case "auth/operation-not-allowed":
          alert(
            "Google Sign-In is currently disabled. Please contact support or try again later."
          );
          break;

        case "auth/unauthorized-domain":
          alert(
            "The current domain is not authorized for Google Sign-In. Please contact support."
          );
          break;

        case "auth/invalid-credential":
          alert(
            "An invalid credential was provided. Please refresh the page and try again."
          );
          break;

        default:
          alert(
            "An unexpected error occurred during sign-in. Please try again later. Error: " +
              error.message
          );
          break;
      }
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      signIn();
    }
  };
  return (
    <div className="signup-element">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="signup-div">
        <div className="signup-home-page">
          <div className="signup-overlap-group">
            <div className="signup-content">
              <div className="signin-image">
                <img src={signinimg} />
              </div>
              <div className={`modal ${open ? "open" : ""}`}>
                <div className="signin-container">
                  <div className="signin-form">
                    <div className="header">
                      <h1 className="title">Sign In</h1>
                      {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="signin-method-toggle">
                      <button
                        onClick={() => {
                          setSignInMethod("email");
                          setError(null);
                          setShowVerificationInput(false);
                        }}
                        className={signInMethod === "email" ? "active" : ""}
                      >
                        Email
                      </button>
                      <button
                        onClick={() => {
                          setSignInMethod("phone");
                          setError(null);
                          setShowVerificationInput(false);
                        }}
                        className={signInMethod === "phone" ? "active" : ""}
                      >
                        Phone
                      </button>
                    </div>

                    {signInMethod === "email" ? (
                      <form onKeyDown={handleKeyPress}>
                        <div className="input-field-box">
                          <label htmlFor="email">Email</label>
                          <div className="input-field">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                              className="input"
                            />
                          </div>
                          <label htmlFor="password">Password</label>
                          <div className="input-field">
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="input"
                            />
                          </div>
                        </div>
                        <div className="button-field">
                          <button
                            onClick={signIn}
                            className="btn"
                            disabled={loading}
                          >
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
                      </form>
                    ) : (
                      <>
                        <div
                          ref={recaptchaContainerRef}
                          id="recaptcha-container"
                        ></div>
                        <div className="input-field">
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone Number (e.g., +1234567890)"
                            className="input"
                          />
                        </div>

                        {!showVerificationInput ? (
                          <div className="button-field">
                            <button
                              onClick={startPhoneVerification}
                              className="btn"
                              disabled={loading}
                            >
                              {loading
                                ? "Sending Code..."
                                : "Get Verification Code"}
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="input-field">
                              <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) =>
                                  setVerificationCode(e.target.value)
                                }
                                placeholder="Enter verification code"
                                className="input"
                              />
                            </div>
                            <div className="button-field">
                              <button
                                onClick={verifyPhoneNumber}
                                className="btn"
                                disabled={loading}
                              >
                                {loading ? "Verifying..." : "Sign In"}
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div className="login-link">
                      <h3>
                        <span style={{ color: "rgb(0 0 0 / 73%)" }}>
                          Don't have an account?
                        </span>
                        <Link to={"/SignUp"}>
                          <span style={{ textDecoration: "underline" }}>
                            Sign Up
                          </span>
                        </Link>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
