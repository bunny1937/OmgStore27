import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Suggestions.css"; // Optional: Add styles for the component

const db = getFirestore();

const SuggestionComponent = () => {
  const [name, setName] = useState("");
  const [thoughts, setThoughts] = useState("");

  const handleSubmit = async () => {
    if (name.trim() === "" || thoughts.trim() === "") {
      toast.warning("Please fill in both fields before submitting.");
      return;
    }

    try {
      // Add feedback to Firestore
      const feedbackRef = collection(db, "Feedback");
      await addDoc(feedbackRef, {
        name,
        thoughts,
        timestamp: new Date().toISOString(),
      });

      // Reset fields and show success message
      setName("");
      setThoughts("");
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="suggestion-container">
      <h3>We Value Your Feedback</h3>
      <div className="suggestion-form">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="suggestion-name-input"
        />
        <textarea
          placeholder="Share your thoughts..."
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          className="suggestion-thoughts-input"
        ></textarea>
        <button onClick={handleSubmit} className="suggestion-submit-button">
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default SuggestionComponent;
