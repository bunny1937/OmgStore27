import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../db/Firebase"; // Adjust your Firebase import
import ProductsCard from "../../shoppingcart/components/ProductsCard";

const CategoryType = () => {
  const { type } = useParams(); // Retrieve the category type from the route
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "Products"), where("Type", "==", type));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{type}</h1>
      <div className="home_content">
        {products.map((product) => (
          <ProductsCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default CategoryType;
