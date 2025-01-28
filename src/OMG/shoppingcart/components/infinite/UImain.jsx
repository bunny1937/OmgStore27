import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "../../../db/Firebase";
import InfiniteMenu from "./InfiniteMenu";
import "./InfiniteMenu.css";

function UImain() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const firestore = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Products"));
        const productsData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            let imgUrl = "/api/placeholder/512/512";

            // Try to get a valid image URL
            if (data.ImgUrls && data.ImgUrls[0]) {
              try {
                // Convert Firebase Storage URL to download URL
                const imageRef = ref(
                  storage,
                  encodeURIComponent(data.ImgUrls[0])
                );
                imgUrl = await getDownloadURL(imageRef);
              } catch (imageError) {
                console.error("Error fetching image URL:", imageError);
                // Fallback to placeholder if image fetch fails
              }
            }

            return {
              id: doc.id,
              ...data,
              image: imgUrl,
              link: `/product/${doc.id}`,
              title: data.Name,
              description: `$${data.Price} - ${data.Description}`,
            };
          })
        );
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [firestore, storage]);

  if (loading) {
    return (
      <div className="Infinite-main loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="Infinite-main">
      {products.length > 0 ? (
        <InfiniteMenu items={products} />
      ) : (
        <div className="no-products">No products available</div>
      )}
    </div>
  );
}

export default UImain;
