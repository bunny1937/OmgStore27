import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { firebaseApp } from "../db/Firebase";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import UserContext from "./UserContext";
import "./SignUp.css";
import toast, { Toaster } from "react-hot-toast";
import signupimg from "../shoppingcart/components/pages/photos/parallax/man-1283231_1280.jpg";

const auth = getAuth(firebaseApp);

const db = getFirestore(firebaseApp);

function SignUp({ onClose, open, onSignUpSuccess }) {
  // State for email/password signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // State for phone auth
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [signupMethod, setSignupMethod] = useState("email"); // "email" or "phone"

  // Common state
  const { setUser } = useContext(UserContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const provider = new GoogleAuthProvider();

  const location = useLocation();
  const navigate = useNavigate();

  // Ref for recaptcha container
  const recaptchaContainerRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Error setting persistence:", error);
    });
  }, []);

  useEffect(() => {
    // Only initialize if we're showing the phone signup method
    if (signupMethod === "phone" && !recaptchaVerifierRef.current) {
      if (!recaptchaContainerRef.current) {
        console.error("recaptchaContainerRef is null");
        return; // Prevent initialization if the ref is not set
      }
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

    // Cleanup function
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (error) {
          console.error("RecaptchaVerifier Cleanup Error:", error);
        }
      }
    };
  }, [signupMethod]);

  // Handle phone number verification
  const startPhoneVerification = async () => {
    if (!phoneNumber || !firstName || !lastName) {
      toast.error("Please enter your name and phone number");
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

      // Reset recaptcha on error
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

      // Create user document in Firestore
      const sanitizedId = `${firstName.trim().toLowerCase()}-${lastName
        .trim()
        .toLowerCase()}-${phoneNumber}`.replace(/[^a-z0-9-]/g, "");

      await setDoc(doc(db, "users", sanitizedId), {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        firstName,
        lastName,
        createdAt: new Date(),
      });

      setUser(user);
      toast.success("Phone number verified successfully!");
      resetForm();
      if (onSignUpSuccess) {
        onSignUpSuccess();
      } else {
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

  useEffect(() => {
    const handleRedirectResult = async () => {
      // Check if we're expecting a redirect result
      const authInProgress = sessionStorage.getItem("authInProgress");
      if (!authInProgress) return;

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          await handleGoogleAuthSuccess(result.user);
          sessionStorage.removeItem("authInProgress");
        }
      } catch (error) {
        console.error("Redirect Error:", error);
        toast.error(error.message || "Failed to complete Google Sign-In");
        sessionStorage.removeItem("authInProgress");
      }
    };

    handleRedirectResult();
  }, []);

  // Handle Google Redirect Result
  // useEffect(() => {
  //   const handleRedirectResult = async () => {
  //     try {
  //       const result = await getRedirectResult(auth);
  //       if (result) {
  //         const user = result.user;

  //         const userDoc = await getDoc(doc(db, "users", user.uid));
  //         if (!userDoc.exists()) {
  //           await setDoc(doc(db, "users", user.uid), {
  //             uid: user.uid,
  //             email: user.email,
  //             firstName: "",
  //             lastName: "",
  //             phoneNumber: "",
  //             createdAt: new Date(),
  //           });
  //         }

  //         setUser(user); // Set user in the context
  //         onClose && onClose(); // Close the modal
  //         toast.success("Sign up successfully");
  //         navigate("/Home");
  //       }
  //     } catch (error) {
  //       toast.error(error.message);
  //       setError("Failed to process Google Sign-In redirect.");
  //     }
  //   };
  //   handleRedirectResult();
  // }, [onClose, navigate, setUser]);

  const signup = async () => {
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      toast.error("Please fill all fields");
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
        phoneNumber
      );
      const user = userCredential.user;
      const redirectTo = location.state?.redirectTo || "/home";
      navigate(redirectTo, { replace: true });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        phoneNumber,
        createdAt: new Date(),
      });

      setUser(user); // Set user in the context
      toast.success("Signup Successful");
      resetForm();
      if (onSignUpSuccess) {
        onSignUpSuccess();
        await signOut(auth);
      } else {
        navigate("/SignIn");
      }
    } catch (error) {
      handleAuthError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create/update user document in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName ? user.displayName.split(" ")[0] : "",
          lastName: user.displayName
            ? user.displayName.split(" ")[1] || ""
            : "",
          phoneNumber: user.phoneNumber || "",
          createdAt: new Date(),
        });
      }

      setUser(user);
      toast.success("Sign up successful!");

      if (onSignUpSuccess) {
        onSignUpSuccess();
      } else {
        navigate("/Home");
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Google Sign In Error:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";

      // More specific error messages
      if (error.code === "auth/popup-blocked") {
        errorMessage =
          "Please allow popups for this website to sign in with Google.";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign in was cancelled. Please try again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }

      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleAuthSuccess = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          firstName: "",
          lastName: "",
          phoneNumber: "",
          createdAt: new Date(),
        });
      }

      setUser(user);
      onClose && onClose();
      navigate("/Home");
    } catch (error) {
      console.error("Error handling Google auth success:", error);
      throw error;
    }
  };
  const handleAuthError = (error) => {
    let errorMessage;
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "This email is already in use.";
        break;
      case "auth/invalid-email":
        errorMessage = "The email address is invalid.";
        break;
      case "auth/weak-password":
        errorMessage = "The password is too weak.";
        break;
      case "auth/popup-closed-by-user":
        errorMessage =
          "The Google sign-up pop-up was closed before completing the process.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error occurred. Please check your connection.";
        break;
      default:
        errorMessage = error.message || "An unknown error occurred.";
    }
    setError(errorMessage);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      signup();
    }
  };
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="signup-element">
        <div className="signup-content">
          <div className={`modal ${open ? "open" : ""}`}>
            <div className="signup-container">
              <div className="signup-form">
                <div className="signup-header">
                  <h1 className="title">Signup</h1>
                  <div className="error-message">{error && <p>{error}</p>}</div>
                </div>
                <div className="signup-method-toggle">
                  <button
                    onClick={() => setSignupMethod("email")}
                    className={signupMethod === "email" ? "active" : ""}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => setSignupMethod("phone")}
                    className={signupMethod === "phone" ? "active" : ""}
                  >
                    Phone
                  </button>
                </div>

                <div className="input-field">
                  <label htmlFor="first-name">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="input"
                  />
                </div>
                <div className="input-field">
                  <label htmlFor="last-name">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="input"
                  />
                </div>
                <div className="input-field">
                  <label htmlFor="phone-number">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone Number (e.g., +1234567890)"
                    className="input"
                  />
                </div>

                {signupMethod === "email" ? (
                  <form onKeyDown={handleKeyPress} className="signup-form">
                    <div className="input-field">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="input"
                      />
                    </div>
                    <div className="input-field">
                      <label htmlFor="password">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="input"
                      />
                    </div>
                    <div className="button-field">
                      <button
                        onClick={signup}
                        className="btn"
                        disabled={loading}
                      >
                        {loading ? "Signing Up..." : "Sign Up with Email"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {!showVerificationInput ? (
                      <div className="button-field">
                        <button
                          id="phone-sign-in-button"
                          onClick={startPhoneVerification}
                          className="btn"
                          disabled={loading}
                        >
                          {loading
                            ? "Sending Code..."
                            : "Send Verification Code"}
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
                            {loading ? "Verifying..." : "Verify Code"}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
                <div ref={recaptchaContainerRef}></div>
                <div className="button-field">
                  <button
                    onClick={signUpWithGoogle}
                    className="btn google-btn"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Sign Up with Google"}
                  </button>
                </div>

                <div className="login-link">
                  <h3>
                    <span style={{ color: "rgb(0 0 0 / 73%)" }}>
                      Already have an account?
                    </span>
                    <Link to={"/SignIn"}>
                      <span style={{ textDecoration: "underline" }}>
                        Sign In
                      </span>
                    </Link>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
