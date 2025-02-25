import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cartContext from "../context/cartContext";
import { firestore, storage } from "../../db/Firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import PaymentQR from "./pages/photos/PaymentQR.jpg";

const styles = `
/* Previous styles remain the same */
.whatsapp-checkout {
  max-width: 800px;
  margin: 20px auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height:86vh;
  overflow-y:scroll;

}

.checkout-header {
  text-align: center;
}

.checkout-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.order-details {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.order-summary {
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  padding: 20px;
}

.order-summary h3 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-name {
  font-weight: 600;
  color: #333;
}

.item-size {
  color: #666;
  font-size: 14px;
}

.item-price {
  color: #333;
  font-weight: 600;
}

.shipping-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px 20px;
}

.shipping-info h3 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 20px;
}

.address-details {
  line-height: 1.6;
  color: #555;
}

.total-section {
  padding-top: 15px;
  border-top: 2px solid #e1e1e1;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #333;
}

.total-row.final {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e1e1e1;
}

.whatsapp-button {
  background-color: #25D366;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.whatsapp-button:hover {
  background-color: #1fba59;
  transform: translateY(-2px);
}

.whatsapp-button:active {
  transform: translateY(0);
}
.payment-section {
  margin:6px 0;
  display: flex;
  padding: 10px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
} 
.qr-code {
  max-width: 300px;
  margin: 20px auto;
  display: block;
} 
.screenshot-upload {
  text-align: center;
} 
.screenshot-preview {
  max-width: 300px;
  margin: 10px auto;
  border-radius: 8px;
  border: 1px solid #e1e1e1;
} 
.upload-button {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 0;
  display: inline-block;
} 
.upload-button:hover {
  background-color: #e9ecef;
}
.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
  text-align: center;
  padding: 4px;
  background: #ffe5e5;
  border-radius: 4px;
  margin: 10px 0;
}

@media (max-width: 768px) {
  .order-details {
    grid-template-columns: 1fr;
  }
  .checkout-header h2{
  font-size:1.4rem;
  margin: 0.4rem 0
  }
  .whatsapp-checkout {
    padding: 15px;
    height:78vh;
overflow-y:scroll;
  }
  .payment-section{
  flex-direction:column
  }
  .item-details {
    align-items: flex-start;
    gap:20px
  }

}`;

const WhatsappOrder = () => {
  const { cartItems, buyNowItem } = useContext(cartContext);
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          // Get user info
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          }

          // Get latest order
          const ordersRef = collection(firestore, "users", user.uid, "orders");
          const ordersSnapshot = await getDocs(ordersRef);
          const orders = ordersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          if (!dataInitialized && (buyNowItem || cartItems.length > 0)) {
            // If the address info should be in sessionStorage or localStorage
            const savedAddress =
              sessionStorage.getItem("selectedAddress") ||
              localStorage.getItem("selectedAddress");
            if (savedAddress) {
              try {
                const parsedAddress = JSON.parse(savedAddress);
                setSelectedAddress(parsedAddress);
                console.log("Restored address from storage:", parsedAddress);
              } catch (e) {
                console.error("Failed to parse saved address:", e);
              }
            }
            setDataInitialized(true);
          }
          // Get most recent order
          if (orders.length > 0) {
            const latestOrder = orders.reduce((latest, current) => {
              const currentDate =
                current.orderCreatedAt?.toDate() || new Date(0);
              const latestDate = latest.orderCreatedAt?.toDate() || new Date(0);
              return currentDate > latestDate ? current : latest;
            });

            setOrderItems(latestOrder.cartItems || []);
            setSelectedAddress(latestOrder.shippingInfo || null);
          } else {
            // If no orders found, use current cart items
            setOrderItems(buyNowItem ? [buyNowItem] : cartItems);
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load order information");
          setLoading(false);
        }
      } else {
        setLoading(false);
        navigate("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate, cartItems, buyNowItem]);

  const calculateTotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleScreenshotUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadScreenshotToFirebase = async (file) => {
    if (!file || !userId) return null;

    try {
      const timestamp = Date.now();
      const storageRef = ref(
        storage,
        `payment-screenshots/${userId}/${timestamp}_${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      throw error;
    }
  };

  const sendToWhatsApp = async () => {
    if (!selectedAddress) {
      toast.error(
        "No address information found. Please complete checkout first."
      );
      navigate("/checkout");
      return;
    }

    if (!paymentScreenshot) {
      toast.error("Please upload payment confirmation screenshot");
      return;
    }

    try {
      setUploadingScreenshot(true);
      const screenshotURL = await uploadScreenshotToFirebase(paymentScreenshot);

      if (!screenshotURL) {
        toast.error("Failed to upload payment screenshot");
        return;
      }

      const itemsList = orderItems
        .map(
          (item) =>
            `${item.quantity}x ${item.Name} (Size: ${item.size}) - ₹${
              item.price * item.quantity
            }`
        )
        .join("\n");

      const message =
        `🛍 New Order Request\n\n` +
        `Customer Details:\n` +
        `Name: ${selectedAddress.name}\n` +
        `Phone: ${selectedAddress.number}\n` +
        `Email: ${selectedAddress.email}\n\n` +
        `Delivery Address:\n` +
        `${selectedAddress.flat}, ${selectedAddress.street}\n` +
        `${selectedAddress.locality}, ${selectedAddress.city}\n` +
        `${selectedAddress.state} - ${selectedAddress.pinCode}\n\n` +
        `Order Items:\n${itemsList}\n\n` +
        `Total Amount: ₹${calculateTotal().toLocaleString()}\n\n` +
        `Payment Status: Completed\n` +
        `Payment Screenshot: ${screenshotURL}`;

      const encodedMessage = encodeURIComponent(message);
      window.open(
        `https://wa.me/+917738513722?text=${encodedMessage}`,
        "_blank"
      );
    } catch (error) {
      toast.error("Failed to process payment screenshot");
      console.error("Error processing screenshot:", error);
    } finally {
      setUploadingScreenshot(false);
      navigate("/Trackorder");
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="whatsapp-checkout">
        <div className="checkout-header">
          <h2>Complete Your Order via WhatsApp</h2>
        </div>

        <div className="order-details">
          <div className="order-summary">
            <h3>Order Summary</h3>
            {orderItems.map((item, index) => (
              <div key={index} className="item">
                <div className="item-details">
                  <img src={item.Img} alt={item.Name} className="item-image" />
                  <div className="item-info">
                    <span className="item-name">{item.Name}</span>
                    <span className="item-size">Size: {item.size}</span>
                    <span className="item-quantity">
                      Quantity: {item.quantity}
                    </span>
                    <span className="item-price">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="total-section">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="total-row final">
                <span>Total</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {selectedAddress && Object.keys(selectedAddress).length > 0 ? (
            <div className="shipping-info">
              <h3>Delivery Information</h3>
              <div className="address-details">
                <p>
                  <strong>{selectedAddress.name}</strong>
                </p>
                <p>Phone: {selectedAddress.number}</p>
                <p>Email: {selectedAddress.email}</p>
                <p>
                  {selectedAddress.flat},{selectedAddress.street}
                </p>
                <p>
                  {selectedAddress.locality}, {selectedAddress.city}
                </p>
                <p>
                  , {selectedAddress.state} - {selectedAddress.pinCode}
                </p>
              </div>
            </div>
          ) : (
            <div className="shipping-info">
              <h3>Delivery Information</h3>
              <div className="address-details">
                <p className="error">
                  No shipping address found. Please complete checkout first.
                </p>
                <button
                  className="upload-button"
                  onClick={() => navigate("/checkout")}
                >
                  Add Shipping Address
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="payment-section">
          <div className="payment-details-info">
            <h3>Payment Details</h3>
            <p className="text-center">
              Scan the QR code below to make the payment
            </p>
            <img src={PaymentQR} alt="Payment QR Code" className="qr-code" />
          </div>
          <div className="screenshot-upload">
            <h4>Upload Payment Screenshot</h4>
            <label className="upload-button">
              Choose Screenshot
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                style={{ display: "none" }}
              />
            </label>
            {screenshotPreview && (
              <img
                src={screenshotPreview}
                alt="Payment Screenshot"
                className="screenshot-preview"
              />
            )}
          </div>
        </div>
        {!selectedAddress && (
          <p className="error">Please add a shipping address</p>
        )}
        {orderItems.length === 0 && (
          <p className="error">No items in your order</p>
        )}
        {!paymentScreenshot && (
          <p className="error">Payment screenshot required</p>
        )}
        <button
          className="whatsapp-button"
          onClick={sendToWhatsApp}
          disabled={
            !selectedAddress ||
            orderItems.length === 0 ||
            !paymentScreenshot ||
            uploadingScreenshot
          }
        >
          {uploadingScreenshot ? "Processing..." : "Complete Order on WhatsApp"}
        </button>
      </div>
    </>
  );
};

export default WhatsappOrder;
