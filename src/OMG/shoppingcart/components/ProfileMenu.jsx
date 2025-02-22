import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBox,
  FaCreditCard,
  FaKey,
  FaHeart,
  FaCheck,
  FaArrowRight,
  FaMapPin,
} from "react-icons/fa";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "../../db/Firebase";
import "./ProfileMenu.css";

function ProfileMenu() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <FaUser />,
      title: "Basic Details",
      description: "Name, Email, Phone Number",
      link: "/profile/BasicDetails",
    },
    {
      icon: <FaBox />,
      title: "My Orders",
      description: "Track, Return & Cancel Orders",
      link: "/profile/orders",
    },
    {
      icon: <FaMapPin />,
      title: "Addresses",
      description: "Save & Manage Addresses",
      link: "/profile/address",
    },
    {
      icon: <FaCreditCard />,
      title: "Payment Methods",
      description: "Add & Manage Payment Methods",
      link: "/profile/payments",
    },
    {
      icon: <FaKey />,
      title: "Account Settings",
      description: "Password & Account Settings",
      link: "/profile/changepassword",
    },
    {
      icon: <FaHeart />,
      title: "My Wishlist",
      description: "Your Saved Items",
      link: "/profile/Favourites",
    },
  ];
  const fetchUserDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserInfo({
            email: userDoc.data().email || "",
            firstName: userDoc.data().firstName || "",
            lastName: userDoc.data().lastName || "",
            phoneNumber: userDoc.data().phoneNumber || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserDetails(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/SignIn");
  };

  if (loading) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-menu-container">
          <p className="profile-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="profile-page-wrapper">
        <div className="profile-menu-container">
          <div className="profile-login-header">
            <User size={48} className="profile-login-avatar" />
            <h2 className="profile-login-header-text">Please Sign In</h2>
            <p className="profile-login-header-text">
              Sign in to access your profile and manage your account
            </p>
            <Link to="/SignIn">
              <button className="profile-login-button"> Sign In</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-menu-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={32} />
          </div>
          <div className="profile-info">
            <h2>{`${userInfo.firstName} ${userInfo.lastName}`}</h2>

            <p>{userInfo.email}</p>
          </div>
        </div>

        <div className="profile-menu-items">
          {menuItems.map((item, index) => (
            <Link to={item.link} key={index} className="profile-menu-item">
              <div className="profile-menu-item-left">
                <div className="profile-menu-icon">{item.icon}</div>
                <div className="profile-menu-text">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
              <FaArrowRight />
            </Link>
          ))}
        </div>

        <button className="profile-logout-button" onClick={logout}>
          <FaCheck />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileMenu;
