import React, { useState } from "react";
// import "./categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: "Minimalist", type: "Main" },
    { id: 2, name: "Spiritual", type: "Main" },
    { id: 3, name: "Hoodies", type: "Type" },
    { id: 4, name: "Oversized", type: "Type" },
    { id: 5, name: "Sweatshirt", type: "Type" },
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [selectedType, setSelectedType] = useState("Main");

  const addCategory = () => {
    if (newCategory.trim() === "") return;
    const newId = categories.length + 1;
    setCategories([
      ...categories,
      { id: newId, name: newCategory, type: selectedType },
    ]);
    setNewCategory("");
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  return (
    <div className="categories-container">
      <h1>Categories Management</h1>

      {/* Add Category */}
      <div className="add-category">
        <input
          type="text"
          placeholder="Enter category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="Main">Main</option>
          <option value="Type">Type</option>
        </select>
        <button onClick={addCategory}>Add Category</button>
      </div>

      {/* Categories Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{category.name}</td>
              <td>{category.type}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => deleteCategory(category.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Categories;
