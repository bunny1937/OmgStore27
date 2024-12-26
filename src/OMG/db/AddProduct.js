import React, { useState } from "react";
import { db } from "./Firebase.js";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL as getDownloadURLFromStorage,
} from "firebase/storage";
import { collection, doc, setDoc, getDocs } from "./Firebase.js"; // Import the collection function

import "./AddProducts.css";
import OrdersDash from "./OrdersDash.jsx";

export const AddProducts = () => {
  const [Name, setProductName] = useState("");
  const [Description, setProductDescription] = useState("");
  const [price, setProductPrice] = useState(0);
  const [Category, setProductCategory] = useState("");
  const [quantity, setProductQuantity] = useState(0);
  const [productImgs, setProductImgs] = useState([]);
  const [Gender, setProductGender] = useState("");
  const [progress, setProgress] = useState(0);
  const [size, setProductSize] = useState([]);

  const types = ["image/png", "image/jpg", "image/jpeg"]; // image types

  const productImgsHandler = (e) => {
    let selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) =>
      types.includes(file.type)
    );

    if (validFiles.length === selectedFiles.length) {
      setProductImgs(validFiles);
    } else {
      setProductImgs([]);
    }
  };

  const toggleSize = (size) => {
    setProductSize((prevSizes) => {
      const updatedSizes = prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size) // Remove if already selected
        : [...prevSizes, size]; // Add if not selected
      console.log("Updated Sizes:", updatedSizes); // Debugging
      return updatedSizes;
    });
  };

  // add product
  const addProduct = async (e) => {
    e.preventDefault();
    const storage = getStorage(); // Get the default storage bucket
    setProgress(new Array(productImgs.length).fill(0)); // Reset progress tracking for each image

    let storageRef;
    switch (Category) {
      case "Jeans":
        storageRef = ref(storage, `/Products/Jeans/${productImgs.name}`);
        break;
      case "Oversize":
        storageRef = ref(storage, `/Products/Oversize/${productImgs.name}`);
        break;
      case "Pants":
        storageRef = ref(storage, `/Products/Pants/${productImgs.name}`);
        break;
      case "Shirts":
        storageRef = ref(storage, `/Products/Shirts/${productImgs.name}`);
        break;
      case "Tshirts":
        storageRef = ref(storage, `/Products/Tshirts/${productImgs.name}`);
        break;
      case "Hoodies":
        storageRef = ref(storage, `/Products/Hoodies/${productImgs.name}`);
        break;
      default:
        return;
    }

    console.log("Storage Ref:", storageRef); // Add this line

    try {
      // Upload each image and get URLs
      const uploadTasks = productImgs.map((img, index) => {
        const storageRef = ref(
          storage,
          `/Products/${Category}/${Date.now()}_${img.name}`
        );

        return new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, img);
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const currentProgress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress((prevProgress) => {
                const updatedProgress = [...prevProgress];
                updatedProgress[index] = currentProgress;
                return updatedProgress;
              });
            },
            (error) => reject(error),
            () => {
              getDownloadURLFromStorage(uploadTask.snapshot.ref)
                .then((url) => resolve(url))
                .catch((error) => reject(error));
            }
          );
        });
      });

      const imgUrls = await Promise.all(uploadTasks);

      // Save product data to Firestore
      const productsCollectionRef = collection(db, "Products");
      const querySnapshot = await getDocs(productsCollectionRef);
      const newId = querySnapshot.docs.length + 1; // ID based on existing count
      const newDocRef = doc(productsCollectionRef, String(newId));

      await setDoc(newDocRef, {
        id: newId,
        Name,
        Description,
        price: Number(price),
        Category,
        Gender,
        quantity,
        ImgUrls: imgUrls,
        size,
      });

      // Reset the form
      setProductName("");
      setProductDescription("");
      setProductGender();
      setProductCategory("");
      setProductPrice(0);
      setProductImgs([]);
      setProductQuantity(0);
      setProductSize([]);
      setProgress([]);
      document.getElementById("file").value = ""; // Clear file input
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <OrdersDash />
      <div className="add-container">
        <br />
        <h2>ADD PRODUCTS</h2>
        <hr />
        <form autoComplete="off" className="form-group" onSubmit={addProduct}>
          <label htmlFor="product-category">Product Category</label>
          <select
            className="text-input"
            required
            onChange={(e) => setProductCategory(e.target.value)}
            value={Category}
          >
            <option value="">Select Category</option>
            <option value="Jeans">Jeans</option>
            <option value="Oversize">Oversize</option>
            <option value="Pants">Pants</option>
            <option value="Shirts">Shirts</option>
            <option value="Tshirts">Tshirts</option>
            <option value="Hoodies">Hoodies</option>
          </select>
          <br />
          <label htmlFor="product-gender">Product Gender</label>
          <select
            className="text-input"
            required
            onChange={(e) => setProductGender(e.target.value)}
            value={Gender}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
          <br />
          <label htmlFor="product-size">Product Size</label>
          <h2>Select Product Sizes</h2>
          <div className="size-selector">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`size-button ${
                  size.includes(size) ? "selected" : ""
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Debugging - show selected sizes */}
          <p>Selected Sizes: {size.join(", ")}</p>

          <br />
          <label htmlFor="product-name">Product Name</label>
          <input
            type="text"
            className="text-input"
            required
            onChange={(e) => setProductName(e.target.value)}
            value={Name}
          />
          <br />
          <label htmlFor="product-name">Product Description</label>
          <input
            type="text"
            className="text-input"
            required
            onChange={(e) => setProductDescription(e.target.value)}
            value={Description}
          />
          <br />
          <label htmlFor="product-price">Product Price</label>
          <input
            type="number"
            className="form-control"
            required
            onChange={(e) => setProductPrice(e.target.value)}
            value={price}
          />
          <br />
          <label htmlFor="product-img">Product Image</label>
          <input
            type="file"
            className="form-control"
            id="file"
            multiple
            required
            onChange={productImgsHandler}
          />
          <br />
          <label htmlFor="product-quantity">Product Quantity</label>
          <input
            type="number"
            className="form-control"
            required
            onChange={(e) => setProductQuantity(e.target.value)}
            value={quantity}
          />
          <br />
          <button type="submit" className="btn btn-success btn-md mybtn">
            ADD
          </button>
          {progress > 0 && (
            <div className="progress">
              <div
                className="progress-bar progress-bar-striped bg-success"
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {progress}% uploaded
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};
export default AddProducts;
