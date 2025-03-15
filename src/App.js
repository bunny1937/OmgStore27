// App.js
import "./App.css";
import React, { useEffect } from "react";
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
import Payment from "./OMG/shoppingcart/components/Trackorder";
import CategoryPage from "./OMG/Hero/Category/Categorypage";
import UserProfile from "./OMG/Auth/UserProfile";
import UserProfile1 from "./OMG/shoppingcart/components/UserProfile/UserProfile";
import Sidebar from "./OMG/shoppingcart/components/UserProfile/Sidebar";
import { BackButtonProvider } from "./OMG/BackHandle/BackContext";
import Support from "./OMG/shoppingcart/components/UserProfile/Support/Support";
import Order from "./OMG/shoppingcart/components/UserProfile/Order";
import Profile1 from "./OMG/shoppingcart/components/UserProfile/Basic/Basic";
import Checkoutold from "./OMG/shoppingcart/components/Checkoutold";
import CategoryType from "./OMG/Hero/Category/CategoryType";
import NetworkProvider from "./OMG/Network/NetworkProvider";
import NetworkStatusBanner from "./OMG/Network/NetworkStatus";
import { Analytics } from "@vercel/analytics/react";
import Users from "./OMG/admin/Components/Users";
import Categories from "./OMG/admin/Components/Categories";
// import Discounts from "./Components/Discounts";
import AdminAnalytics from "./OMG/admin/Components/Analytics";
import Settings from "./OMG/admin/Components/Settings";
import AddProducts from "./OMG/db/AddProduct";
import OrdersDash from "./OMG/admin/Components/OrdersDash";
import Checkoutnew from "./OMG/shoppingcart/components/Checkoutnew";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { SignInnew } from "./OMG/Auth/SignInnew";
import ProfileMenu from "./OMG/shoppingcart/components/ProfileMenu";
import BasicDetails from "./OMG/shoppingcart/components/UserProfile/Profile";
import { Payments } from "@mui/icons-material";
import Address from "./OMG/shoppingcart/components/UserProfile/Address";
import Orders from "./OMG/shoppingcart/components/UserProfile/Order";
import ChangePassword from "./OMG/shoppingcart/components/UserProfile/ChangePassword";
import WhatsappOrder from "./OMG/shoppingcart/components/WhatsappOrder";
import AdminDashboard from "./OMG/admin/AdminLayout";
import Trackorder from "./OMG/shoppingcart/components/Trackorder";
import PrintOnDemand from "./OMG/shoppingcart/components/PrintonDemand";
import PrintOnDemandAdmin from "./OMG/admin/Components/AdminPrintonDemand";
import FeaturedProducts from "./OMG/admin/Components/FeaturedProduct";
import BestSellingProducts from "./OMG/admin/Components/BestSelling";
import { WishlistProvider } from "./OMG/shoppingcart/components/Wishlist";

function App() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <NetworkProvider>
        <NetworkStatusBanner />
        <BackButtonProvider>
          <UserProvider>
            <ParallaxProvider>
              <WishlistProvider>
                <FavouritesProvider>
                  <CartProvider>
                    <Cart />
                    <Header />
                    <Routes>
                      <Route path="/" element={<Heroui />} />
                      <Route path="/SignUp" element={<Signup />} />
                      <Route path="/ProfileMenu" element={<ProfileMenu />} />
                      <Route path="/profile" element={<ProfileMenu />} />
                      <Route
                        path="/profile/BasicDetails"
                        element={<BasicDetails />}
                      />
                      <Route path="/profile/orders" element={<Orders />} />
                      <Route path="/profile/address" element={<Address />} />
                      <Route path="/profile/payments" element={<Payment />} />
                      <Route
                        path="/profile/changepassword"
                        element={<ChangePassword />}
                      />
                      <Route
                        path="/profile/Favourites"
                        element={<Favourites />}
                      />
                      <Route
                        path="/PrintonDemand"
                        element={<PrintOnDemand />}
                      />
                      <Route path="UserProfile" element={<UserProfile />} />
                      <Route
                        path="/UserProfile1/*"
                        element={<UserProfile1 />}
                      />
                      <Route path="/Profile1" element={<Profile1 />} />
                      <Route path="/Support" element={<Support />} />
                      <Route path="/Order" element={<Order />} />
                      <Route path="/Sidebar" element={<Sidebar />} />
                      <Route path="/SignIn" element={<SignInnew />} />
                      <Route path="/Home" element={<Home />} />
                      <Route path="/Details/:id" element={<Details />} />
                      <Route path="/Favourites" element={<Favourites />} />
                      <Route
                        path="/category/:categoryName"
                        element={<CategoryPage key={Math.random()} />}
                      />
                      <Route
                        path="/products/:type"
                        element={<CategoryType />}
                      />
                      <Route path="/Cart" element={<Cart />} />
                      <Route
                        path="/Checkout/:mode?"
                        element={<Checkoutnew />}
                      />
                      <Route path="/Trackorder" element={<Trackorder />} />
                      <Route
                        path="/Whatsapporder"
                        element={<WhatsappOrder />}
                      />
                      <Route path="/AdminDash" element={<AdminDash />} />
                      {/* Protected Route for Admin */}
                      <Route
                        path="/admin/*"
                        element={
                          <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      >
                        <Route path="dashboard" element={<AdminDash />} />
                        <Route path="users" element={<Users />} />
                        <Route path="addproducts" element={<AddProducts />} />
                        <Route path="adminorders" element={<OrdersDash />} />
                        <Route path="categories" element={<Categories />} />
                        <Route
                          path="adminanalytics"
                          element={<AdminAnalytics />}
                        />
                        <Route path="settings" element={<Settings />} />
                        <Route path="p-o-d" element={<PrintOnDemandAdmin />} />
                        <Route
                          path="featuredproduct"
                          element={<FeaturedProducts />}
                        />
                        <Route
                          path="bestselling"
                          element={<BestSellingProducts />}
                        />
                      </Route>
                      {/* <Route path="/users" element={<Users />} />
                    <Route path="/addproducts" element={<AddProducts />} />
                    <Route path="/adminorders" element={<OrdersDash />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route
                      path="/adminanalytics"
                      element={<AdminAnalytics />}
                    />
                    <Route path="/settings" element={<Settings />} /> */}
                    </Routes>
                  </CartProvider>
                </FavouritesProvider>
              </WishlistProvider>
            </ParallaxProvider>
          </UserProvider>
        </BackButtonProvider>
      </NetworkProvider>
    </>
  );
}

export default App;
