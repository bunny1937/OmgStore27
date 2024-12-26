import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../../db/Firebase";
import ProductsCard from "../../shoppingcart/components/ProductsCard";
import "../../shoppingcart/index.css";

const CategoryPage = () => {
  const { categoryName } = useParams(); // Get category name from URL
  const [products, setProducts] = useState([]);
  const firestore = getFirestore(firebaseApp);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(firestore, "Products"));
      const filteredProducts = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((product) => product.Category === categoryName);
      setProducts(filteredProducts);
    };

    fetchProducts();
  }, [categoryName, firestore]);

  return (
    <div className="category-page">
      <h1>{categoryName}</h1>
      <div className="home_content">
        {products.map((product) => (
          <ProductsCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
