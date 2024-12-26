import React, { useState, useContext, useEffect } from "react";
import { Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContactUs from "../Contact-Us";
import ReturnRefund from "../Return-Refund";
import TermsCo from "../Terms-Co";
import "../Basic/Basic.css";
function Support() {
  const [contactOpen, setContactOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const toggleContent = (type) => {
    if (type === "contact") {
      setContactOpen(!contactOpen);
    }
    if (type === "terms") {
      setTermsOpen(!termsOpen);
    } else if (type === "refund") {
      setRefundOpen(!refundOpen);
    }
  };

  return (
    <div className="description-box">
      <div className="prod-details">
        <h1>Help Desk</h1>
      </div>
      <div className="details-accordion">
        <div>
          <h3
            onClick={() => toggleContent("contact")}
            className="accordion-header"
          >
            Contact Us
            <ExpandMoreIcon
              className={`expand-icon ${contactOpen ? "expanded" : ""}`}
            />
          </h3>
          <Collapse in={contactOpen}>
            <div className="accordion-content">
              <ContactUs />
            </div>
          </Collapse>
        </div>

        <div>
          <h3
            onClick={() => toggleContent("refund")}
            className="accordion-header"
          >
            Return & Refund
            <ExpandMoreIcon
              className={`expand-icon ${refundOpen ? "expanded" : ""}`}
            />
          </h3>
          <Collapse in={refundOpen}>
            <div className="accordion-content">
              <ReturnRefund />
            </div>
          </Collapse>
        </div>
        <div>
          <h3
            onClick={() => toggleContent("terms")}
            className="accordion-header"
          >
            Terms & Conditions
            <ExpandMoreIcon
              className={`expand-icon ${termsOpen ? "expanded" : ""}`}
            />
          </h3>
          <Collapse in={termsOpen}>
            <div className="accordion-content">
              <TermsCo />
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
}

export default Support;
