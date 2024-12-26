import React from "react";
import { useNavigate } from "react-router-dom";

function Breadcrumb({ title }) {
  const navigate = useNavigate();

  return (
    <div className="breadcrumb">
      <span onClick={() => navigate(-1)}>Home {">"}</span>
      <span>{title}</span>
    </div>
  );
}

export default Breadcrumb;
