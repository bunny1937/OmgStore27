import React, { useContext } from "react";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import cartContext from "../context/cartContext";

const QuantityControls = ({ item, isBuyNow = false }) => {
  const {
    incrementItem,
    decrementItem,
    removeItem,
    incrementBuyNowItem,
    decrementBuyNowItem,
    removeBuyNowItem,
  } = useContext(cartContext);

  const handleIncrement = () => {
    if (isBuyNow) {
      incrementBuyNowItem();
    } else {
      incrementItem(item.id, item.size);
    }
  };

  const handleDecrement = () => {
    if (isBuyNow) {
      decrementBuyNowItem();
    } else {
      decrementItem(item.id, item.size);
    }
  };

  const handleRemove = () => {
    if (isBuyNow) {
      removeBuyNowItem();
    } else {
      removeItem(item.id, item.size);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDecrement}
        disabled={item.quantity <= 1}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <FaMinus className="w-4 h-4" />
      </button>

      <span className="w-8 text-center">{item.quantity}</span>

      <button
        onClick={handleIncrement}
        className="p-2 rounded hover:bg-gray-100"
        aria-label="Increase quantity"
      >
        <FaPlus className="w-4 h-4" />
      </button>

      <button
        onClick={handleRemove}
        className="p-2 rounded hover:bg-gray-100 text-red-500"
        aria-label="Remove item"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantityControls;
