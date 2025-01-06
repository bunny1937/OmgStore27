// App.js
import "./App.css";
import React, { useRef } from "react";
import Header from "./OMG/shoppingcart/components/Header";
import Home from "./OMG/shoppingcart/pages/Home";
import Heroui from "./OMG/Hero/Heroui";
import Cart from "./OMG/shoppingcart/components/Cart";
import Details from "./OMG/shoppingcart/components/details";
import Favourites from "./OMG/shoppingcart/components/Favourites";
import { CartProvider } from "./OMG/shoppingcart/context/cartContext";
import { FavouritesProvider } from "./OMG/shoppingcart/components/FavoritesContext";
import Signup from "./OMG/Auth/SignUp";
import SignIn from "./OMG/Auth/SignIn";
import { Route, Routes } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import "./OMG/shoppingcart/index.css";
import { ProtectedRoute } from "./OMG/shoppingcart/components/protectRoute/ProtectedRoute";
import AdminDash from "./OMG/Auth/AdminDash";
import { UserProvider } from "./OMG/Auth/UserContext";
import Checkout from "./OMG/shoppingcart/components/Checkout";
import Payment from "./OMG/shoppingcart/components/Payment";
import CategoryPage from "./OMG/Hero/Category/Categorypage";
import UserProfile from "./OMG/Auth/UserProfile";
import UserProfile1 from "./OMG/shoppingcart/components/UserProfile/UserProfile";
import Sidebar from "./OMG/shoppingcart/components/UserProfile/Sidebar";
import { BackButtonProvider } from "./OMG/BackHandle/BackContext";
import Support from "./OMG/shoppingcart/components/UserProfile/Support/Support";
import Profile from "./OMG/shoppingcart/components/UserProfile/Profile";
import Profile1 from "./OMG/shoppingcart/components/UserProfile/Basic/Basic";
import Checkoutold from "./OMG/shoppingcart/components/Checkoutold";
import Cursor from "./OMG/Cursor";

function App() {
  const containerRef = useRef(null);

  return (
    <>
      <BackButtonProvider>
        <UserProvider>
          <ParallaxProvider>
            <FavouritesProvider>
              <CartProvider>
                <Cursor />
                <Header />
                <Routes>
                  <Route path="/" element={<Heroui />} />
                  <Route path="/SignUp" element={<Signup />} />
                  <Route path="UserProfile" element={<UserProfile />} />
                  <Route path="/UserProfile1/*" element={<UserProfile1 />} />
                  <Route path="/Profile1" element={<Profile1 />} />
                  <Route path="/Support" element={<Support />} />

                  <Route path="/Sidebar" element={<Sidebar />} />
                  <Route path="/SignIn" element={<SignIn />} />
                  <Route path="/Home" element={<Home />} />
                  <Route path="/Details/:id" element={<Details />} />
                  <Route path="/Favourites" element={<Favourites />} />

                  <Route
                    path="/category/:categoryName"
                    element={<CategoryPage key={Math.random()} />}
                  />
                  <Route path="/Cart" element={<Cart />} />
                  <Route path="/Checkoutold" element={<Checkoutold />} />
                  <Route path="/Payment" element={<Payment />} />
                  <Route path="/AdminDash" element={<AdminDash />} />
                  {/* Protected Route for Admin */}
                  <Route
                    path="/AdminDash"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminDash />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </CartProvider>
            </FavouritesProvider>
          </ParallaxProvider>
        </UserProvider>
      </BackButtonProvider>
    </>
  );
}

export default App;
