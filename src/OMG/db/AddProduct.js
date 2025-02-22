// AddProducts.js
import React, { useState, useEffect } from "react";
import { db } from "./Firebase.js";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL as getDownloadURLFromStorage,
} from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import "./AddProducts.css";

const AddProducts = () => {
  const [products, setProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [productForm, setProductForm] = useState({
    Name: "",
    Description: "",
    price: 0,
    Category: "",
    quantity: 0,
    Gender: "",
    Type: "",
    size: [],
    productImgs: [],
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    // Convert IDs to numbers and compare
    return Number(a.id) - Number(b.id);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSize = (size) => {
    setProductForm((prev) => {
      const currentSizes = [...prev.size];
      const sizeIndex = currentSizes.indexOf(size);

      if (sizeIndex === -1) {
        // Add size if not present
        currentSizes.push(size);
      } else {
        // Remove size if already present
        currentSizes.splice(sizeIndex, 1);
      }

      console.log("Updated sizes:", currentSizes); // For debugging

      return {
        ...prev,
        size: currentSizes,
      };
    });
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files); // Convert FileList to Array
    const updatedImages = files.map((file) => ({
      url: URL.createObjectURL(file), // Create a preview URL
      name: file.name,
    }));
    setProductForm((prev) => ({
      ...prev,
      productImgs: files,
    }));
    setImages(updatedImages);
  };

  const resetThumbnails = () => {
    setImages([]); // Clears only the thumbnails
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "Products", String(productId)));
        await fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      Name: product.Name,
      Description: product.Description,
      price: product.price,
      Category: product.Category,
      quantity: product.quantity,
      Gender: product.Gender,
      Type: product.Type,
      size: product.size || [],
      productImgs: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storage = getStorage();

    try {
      let imgUrls = [];
      if (productForm.productImgs.length > 0) {
        const uploadTasks = productForm.productImgs.map((img) => {
          const storageRef = ref(
            storage,
            `/Products/${productForm.Category}/${Date.now()}_${img.name}`
          );

          return new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, img);
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
              },
              reject,
              () =>
                getDownloadURLFromStorage(uploadTask.snapshot.ref).then(resolve)
            );
          });
        });

        imgUrls = await Promise.all(uploadTasks);
      }

      const productData = {
        Name: productForm.Name,
        Type: productForm.Type,
        Description: productForm.Description,
        price: Number(productForm.price),
        Category: productForm.Category,
        Gender: productForm.Gender,
        quantity: Number(productForm.quantity),
        size: productForm.size,
      };

      if (imgUrls.length > 0) {
        productData.ImgUrls = imgUrls;
      }

      if (editingProduct) {
        await updateDoc(
          doc(db, "Products", String(editingProduct.id)),
          productData
        );
      } else {
        const productsCollectionRef = collection(db, "Products");
        const querySnapshot = await getDocs(productsCollectionRef);
        const newId = querySnapshot.docs.length + 1;
        await setDoc(doc(productsCollectionRef, String(newId)), {
          id: newId,
          ...productData,
        });
      }

      setProductForm({
        Name: "",
        Description: "",
        price: 0,
        Category: "",
        quantity: 0,
        Gender: "",
        Type: "",
        size: [],
        productImgs: [],
      });
      setIsAddingProduct(false);
      setEditingProduct(null);
      setProgress(0);
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <div className="product-management">
      <div className="addproduct-header">
        <h1>Product Management</h1>
        <button
          className="addproduct-add-button"
          onClick={() => setIsAddingProduct(true)}
        >
          Add New Product
        </button>
      </div>

      <div className="addproduct-products-grid">
        {sortedProducts.map((product) => (
          <div key={product.id} className="addproduct-product-card">
            <div className="addproduct-product-id">ID: {product.id}</div>
            <div className="addproduct-product-image">
              {product.ImgUrls && product.ImgUrls[0] && (
                <img src={product.ImgUrls[0]} alt={product.Name} />
              )}
            </div>
            <div className="addproduct-product-info">
              <h3>{product.Name}</h3>
              <p className="addproduct-description">
                Desc:-{product.Description}
              </p>
              <p className="addproduct-price">₹{product.price}</p>
              <div className="addproduct-details">
                <span>{product.Type}</span>
                <span>{product.Category}</span>
                <span>{product.Gender}</span>
                <span>{product.quantity} no.</span>
              </div>
              <div className="addproduct-sizes">
                {product.size &&
                  product.size.map((size) => (
                    <span key={size} className="addproduct-size-tag">
                      {size}
                    </span>
                  ))}
              </div>
              <div className="addproduct-actions">
                <button
                  className="addproduct-edit-button"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button
                  className="addproduct-delete-button"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(isAddingProduct || editingProduct) && (
        <div className="addproduct-modal-overlay">
          <div className="addproduct-modal">
            <div className="addproduct-modal-image-section">
              <label className="addproduct-file-input-wrapper">
                <input
                  type="file"
                  multiple
                  className="file-input"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <div className="addproduct-file-input-label">
                  <span>Click or drag images here</span>
                  <br />
                  <small>Upload product images</small>
                  {/* Show Uploaded Images */}
                  <div className="uploaded-images">
                    <div className="uploaded-images-list">
                      {images.map((image, index) => (
                        <div key={index} className="image-thumbnail">
                          <span>{index + 1} - </span>
                          <img src={image.url} alt={`Uploaded ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                    {images.length > 0 && (
                      <button
                        onClick={resetThumbnails}
                        className="addproduct-reset-button"
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              </label>
            </div>

            <form onSubmit={handleSubmit} className="addproduct-modal-content">
              <div className="addproduct-product-form-header">
                <input
                  type="text"
                  name="Name"
                  placeholder="Product Name"
                  value={productForm.Name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="Description"
                  placeholder="Product Description"
                  value={productForm.Description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="addproduct-price-section">
                <span>₹</span>
                <input
                  type="number"
                  name="price"
                  className="addproduct-product-price-input"
                  value={productForm.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="addproduct-product-details-grid">
                <select
                  name="Type"
                  value={productForm.Type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Minimalist">Minimalist</option>
                  <option value="Spiritual">Spiritual</option>
                </select>

                <select
                  name="Category"
                  value={productForm.Category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Oversize">Oversize</option>
                  <option value="Tshirts">Tshirts</option>
                  <option value="Hoodies">Hoodies</option>
                </select>

                <select
                  name="Gender"
                  value={productForm.Gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={productForm.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="addproduct-form-group">
                <label>Sizes</label>
                <div className="addproduct-size-buttons">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      type="button"
                      key={size}
                      className={`addproduct-size-button ${
                        productForm.size.includes(size) ? "active" : ""
                      }`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                      {productForm.size.includes(size) && (
                        <span className="addproduct-checkmark">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="addproduct-selected-sizes">
                  Selected sizes: {productForm.size.join(", ")}
                </div>
              </div>

              {progress > 0 && (
                <div className="addproduct-progress-bar">
                  <div
                    className="addproduct-progress"
                    style={{ width: `${progress}%` }}
                  >
                    {progress}% uploaded
                  </div>
                </div>
              )}
              <div className="addproduct-modal-actions">
                <button type="submit" className="addproduct-save-button">
                  {editingProduct ? "Update" : "Add"} Product
                </button>
                <button
                  type="button"
                  className="addproduct-cancel-button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProducts;
