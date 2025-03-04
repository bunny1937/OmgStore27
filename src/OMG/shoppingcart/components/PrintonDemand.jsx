import React, { useState, useEffect } from "react";
import "./PrintonDemand.css";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const PrintOnDemand = () => {
  // State management
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [clothQuality, setClothQuality] = useState("standard");
  const [thickness, setThickness] = useState("medium");
  const [puff, setPuff] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [price, setPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  // Preview images
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  // Firebase references
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  // Get current user on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    // Initial price calculation
    calculatePrice();

    return () => unsubscribe();
  }, []);

  // Calculate price based on selections
  const calculatePrice = () => {
    let basePrice = 20; // Base price for the product

    // Add price based on cloth quality
    if (clothQuality === "standard") basePrice += 50;
    if (clothQuality === "Pure-Cotton") basePrice += 100;
    if (clothQuality === "Terry-Cotton") basePrice += 150;

    // Add price based on thickness
    if (thickness === "Thin") basePrice += 20;
    if (thickness === "medium") basePrice += 40;
    if (thickness === "thick") basePrice += 60;
    if (thickness === "extra-thick") basePrice += 100;

    // Fixed: Only add puff printing price if puff is true
    if (!puff) basePrice += 100;

    setPrice(basePrice);
    return basePrice;
  };

  // Handle image uploads
  const handleFrontImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFrontImage(e.target.files[0]);
      setFrontPreview(URL.createObjectURL(e.target.files[0]));
      calculatePrice();
    }
  };

  const handleBackImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBackImage(e.target.files[0]);
      setBackPreview(URL.createObjectURL(e.target.files[0]));
      calculatePrice();
    }
  };

  // Upload image to Firebase Storage and get download URL
  const uploadImageToFirebase = async (image, imageName) => {
    if (!image) return null;

    const storageRef = ref(
      storage,
      `printOnDemand/${userId}/${Date.now()}_${imageName}`
    );
    await uploadBytes(storageRef, image);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  // Handle form submission with Firebase storage and Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please login to place an order");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate final price
      const finalPrice = calculatePrice();

      // Upload images to Firebase Storage
      const frontImageURL = await uploadImageToFirebase(
        frontImage,
        "front_design"
      );
      const backImageURL = backImage
        ? await uploadImageToFirebase(backImage, "back_design")
        : null;

      // Create order data object
      const orderData = {
        userId,
        timestamp: new Date(),
        clothQuality,
        thickness,
        puff,
        customRequest: customRequest || "None",
        price: finalPrice,
        frontImageURL,
        backImageURL,
        status: "Pending",
      };

      // Save order to Firestore
      const orderRef = doc(collection(db, "users", userId, "PrintOnDemand"));
      await setDoc(orderRef, orderData);

      // Prepare data for WhatsApp
      const message = `New Print-on-Demand Order:
      - Order ID: ${orderRef.id}
      - Cloth Quality: ${clothQuality}
      - Thickness: ${thickness}
      - Puff Printing: ${puff ? "Yes" : "No"}
      - Custom Request: ${customRequest || "None"}
      - Price: ₹${finalPrice}`;

      // Send to WhatsApp
      const whatsappNumber = "+917738513722"; // Admin's number
      const encodedMessage = encodeURIComponent(message);
      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
        "_blank"
      );

      alert("Your order has been placed successfully!");

      // Reset form
      setFrontImage(null);
      setBackImage(null);
      setFrontPreview(null);
      setBackPreview(null);
      setClothQuality("standard");
      setThickness("medium");
      setPuff(false);
      setCustomRequest("");
      calculatePrice();
    } catch (error) {
      console.error("Error processing order:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="print-on-demand-container">
      <h1>Custom Print on Demand</h1>
      <p>
        Create your custom printed product by uploading your designs and
        selecting options below.
      </p>

      <form onSubmit={handleSubmit} className="pod-form">
        <div className="image-upload-section">
          <div className="image-upload">
            <h3>Front Design</h3>
            <div className="upload-area">
              {frontPreview ? (
                <img
                  src={frontPreview}
                  alt="Front design preview"
                  className="image-preview"
                />
              ) : (
                <div className="upload-placeholder">
                  <p>Click to upload your front design</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFrontImageChange}
                required
              />
            </div>
          </div>

          <div className="image-upload">
            <h3>Back Design</h3>
            <div className="upload-area">
              {backPreview ? (
                <img
                  src={backPreview}
                  alt="Back design preview"
                  className="image-preview"
                />
              ) : (
                <div className="upload-placeholder">
                  <p>Click to upload your back design</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBackImageChange}
              />
            </div>
          </div>
        </div>

        <div className="options-section">
          <div className="option-group">
            <label>Cloth Quality:</label>
            <select
              value={clothQuality}
              onChange={(e) => {
                setClothQuality(e.target.value);
                calculatePrice();
              }}
            >
              <option value="standard">Standard (+ ₹50)</option>
              <option value="Terry-Cotton">Terry Cotton (+ ₹150)</option>
              <option value="Pure-Cotton">Pure Cotton (+ ₹100)</option>
            </select>
          </div>

          <div className="option-group">
            <label>Thickness:</label>
            <select
              value={thickness}
              onChange={(e) => {
                setThickness(e.target.value);
                calculatePrice();
              }}
            >
              <option value="Thin">Thin 100GSM (+ ₹20)</option>
              <option value="medium">Medium 160GSM (+ ₹40)</option>
              <option value="thick">Thick 240GSM (+ ₹60)</option>
              <option value="extra-thick">Extra Thick 280GSM (+ ₹100)</option>
            </select>
          </div>

          <div className="option-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={puff}
                onChange={(e) => {
                  setPuff(e.target.checked);
                  calculatePrice();
                }}
              />
              Puff Printing (+ ₹100)
            </label>
          </div>

          <div className="option-group">
            <label>Custom Requests:</label>
            <textarea
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              placeholder="Any special instructions or requests?"
              rows="4"
            ></textarea>
          </div>
        </div>

        <div className="price-section">
          <h2>Total Price: ₹{price}</h2>
          <button
            type="submit"
            className="order-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrintOnDemand;
