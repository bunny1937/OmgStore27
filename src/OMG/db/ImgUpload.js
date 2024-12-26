import React, { useState } from "react";
import { storage } from "./Firebase.js";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL as getDownloadURLFromStorage,
} from "firebase/storage";

export const ImageUpload = () => {
  const [productImg, setProductImg] = useState(null);
  const [Category, setProductCategory] = useState("");

  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const types = ["image/png", "image/jpeg"]; // image types

  const productImgHandler = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile && types.includes(selectedFile.type)) {
      setProductImg(selectedFile);
      setError("");
    } else {
      setProductImg(null);
      setError("Please select a valid image type (jpg or png)");
    }
    console.log("Product Image:", productImg); // Add this line
  };

  // upload image
  const uploadImage = (e) => {
    e.preventDefault();
    const storage = getStorage(); // Get the default storage bucket

    let storageRef;
    switch (Category) {
      case "Jeans":
        storageRef = ref(storage, `/Products/Jeans/${productImg.name}`);
        break;
      case "Oversize":
        storageRef = ref(storage, `/Products/Oversize/${productImg.name}`);
        break;
      case "Pants":
        storageRef = ref(storage, `/Products/Pants/${productImg.name}`);
        break;
      case "Shirts":
        storageRef = ref(storage, `/Products/Shirts/${productImg.name}`);
        break;
      case "Tshirts":
        storageRef = ref(storage, `/Products/Tshirts/${productImg.name}`);
        break;
      default:
        setError("Please select a valid product category");
        return;
    }
    storageRef = ref(storage, storageRef);

    console.log("Storage Ref:", storageRef); // Add this line

    const uploadTask = uploadBytesResumable(storageRef, productImg);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (err) => setError(err.message),
      () => {
        getDownloadURLFromStorage(storageRef).then((url) => {
          console.log("Image URL:", url);
        });
      }
    );
  };

  return (
    <div className="image-upload-container">
      <br />
      <h2>UPLOAD IMAGE</h2>
      <hr />
      <form autoComplete="off" className="form-group" onSubmit={uploadImage}>
        <label htmlFor="product-img">Select Image</label>
        <input
          type="file"
          className="form-control"
          id="file"
          required
          onChange={productImgHandler}
        />
        <br />
        <button type="submit" className="btn btn-success btn-md mybtn">
          UPLOAD
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
  );
};
export default ImageUpload;
