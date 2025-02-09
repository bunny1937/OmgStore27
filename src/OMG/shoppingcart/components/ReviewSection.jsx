import React, { useState, useEffect, useContext } from "react";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  collection,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import UserContext from "../../Auth/UserContext";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "../../db/Firebase";
import "./ReviewSection.css";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const ReviewComponent = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState(product?.Review || []);
  const [newReview, setNewReview] = useState("");
  const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "" });
  const { user } = useContext(UserContext);
  const [photo, setPhoto] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (id) {
      const productsRef = collection(db, "Products");
      const productRef = doc(productsRef, id);

      getDoc(productRef)
        .then((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            console.log("Product data fetched successfully:", doc.data());
            setProduct(data);
            setReviews(data.Reviews || []);
          } else {
            console.log("Product not found!");
          }
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
        });
    }
  }, [id]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserInfo({
              firstName: userDoc.data().firstName || "",
              lastName: userDoc.data().lastName || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handlePhotoUpload = async () => {
    if (!photo) return null;
    const photoRef = ref(storage, `reviews/${id}/${photo.name}`);
    await uploadBytes(photoRef, photo);
    const url = await getDownloadURL(photoRef);
    return url;
  };

  const handleAddReview = async () => {
    if (!user) {
      toast.error("You need to sign in to add a review.");
      return;
    }

    if (newReview.trim() === "") {
      toast.error("Review cannot be empty!");
      return;
    }

    try {
      const photoUrl = await handlePhotoUpload();

      const newReviewObj = {
        userId: user.uid,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        reviewText: newReview,
        rating,
        photoUrl: photoUrl || null,
        timestamp: new Date().toISOString(),
      };

      if (!id) {
        throw new Error("Product ID is not available.");
      }

      const productRef = doc(db, "Products", id);
      await updateDoc(productRef, {
        Reviews: [...reviews, newReviewObj],
      });

      setReviews((prevReviews) => [...prevReviews, newReviewObj]);
      setNewReview("");
      setPhoto(null);
      setRating(0);
      toast.success("Review added successfully!");
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Failed to add review. Please try again.");
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleResetRating = () => {
    setRating(0);
  };

  const renderStars = (rating) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className="star"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill={
            i <= rating ? "gold" : i - rating <= 0.5 ? "url(#half)" : "white"
          }
          stroke="black"
          strokeWidth="1"
          style={{ margin: "0 2px" }}
        >
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="gold" />
              <stop offset="50%" stopColor="white" />
            </linearGradient>
          </defs>
          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.748 1.448 8.244L12 18.75l-7.384 4.548 1.448-8.244-6.064-5.748 8.332-1.151z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className="reviews-section">
      <div className="reviews-list">
        <h3>Reviews</h3>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-data">
                <p>
                  {review.firstName} {review.lastName}
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </p>
                <div className="review-info">
                  {review.photoUrl && (
                    <img
                      src={review.photoUrl}
                      alt="Review"
                      className="review-photo"
                    />
                  )}
                  <p>{review.reviewText}</p>
                </div>
              </div>
              <span>{new Date(review.timestamp).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <h2>
              ⭐ Be the first to review! Share your experience and help others.
              ⭐
            </h2>
          </div>
        )}
      </div>

      <div className="add-review">
        <h3>Add Review</h3>
        <textarea
          placeholder="Your Feedback..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        ></textarea>
        <div className="photo-box">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />
          {photo && (
            <button className="reset-button" onClick={handleRemovePhoto}>
              x
            </button>
          )}
        </div>

        {photo && (
          <img
            className="photo-box-img"
            src={URL.createObjectURL(photo)}
            alt="Preview"
          />
        )}
        <div className="rating-input">
          <label>Rating: </label>

          <div className="stars-input">
            <div className="stars">
              {renderStars(rating).map((star, index) => (
                <span
                  key={index}
                  onClick={() => setRating(index + 1)}
                  style={{ cursor: "pointer" }}
                >
                  {star}
                </span>
              ))}
            </div>
            {rating > 0 && (
              <button className="reset-button" onClick={handleResetRating}>
                x
              </button>
            )}
          </div>
        </div>
        <button className="review-submit" onClick={handleAddReview}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default ReviewComponent;
