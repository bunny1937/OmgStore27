import React, { useState } from "react";

const NewAddressForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.street &&
      formData.city &&
      formData.state &&
      formData.pinCode
    ) {
      onSave(formData);
      // Reset form after successful submission
      setFormData({ name: "", street: "", city: "", state: "", pinCode: "" });
    } else {
      // Show an error message or handle the case when fields are incomplete
      alert("Please fill out all fields");
    }
  };

  return (
    <div className="new-address-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleInputChange}
          placeholder="Street"
        />
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="City"
        />
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          placeholder="State"
        />
        <input
          type="text"
          name="pinCode"
          value={formData.pinCode}
          onChange={handleInputChange}
          placeholder="Pin Code"
        />
        <button type="submit">Save Address</button>
      </form>
    </div>
  );
};

export default NewAddressForm;
