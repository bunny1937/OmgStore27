import React, { useState } from "react";
import { Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Profile from "../Profile";
import Address from "../Address";
import Order from "../Order";

function Profile1() {
  const [activeAccordion, setActiveAccordion] = useState(null); // Track the active accordion
  console.log("Active Accordion:", activeAccordion);

  const handleAccordionClick = (accordionName) => {
    // If the clicked accordion is already active, close it; otherwise, open it
    setActiveAccordion((prev) =>
      prev === accordionName ? null : accordionName
    );
  };

  return (
    <div className="description-box">
      <div className="prod-details">
        <h3>Profile Details</h3>
      </div>
      <div className="details-accordion">
        {/* Profile Accordion */}
        <div>
          <h3
            onClick={() => handleAccordionClick("profile")}
            className="accordion-header"
          >
            Profile
            <ExpandMoreIcon
              className={`expand-icon ${
                activeAccordion === "profile" ? "expanded" : ""
              }`}
            />
          </h3>
          <Collapse in={activeAccordion === "profile"}>
            <div className="accordion-content">
              <Profile />
            </div>
          </Collapse>
        </div>

        {/* Address Accordion */}
        <div>
          <h3
            onClick={() => handleAccordionClick("address")}
            className="accordion-header"
          >
            Shipping Address
            <ExpandMoreIcon
              className={`expand-icon ${
                activeAccordion === "address" ? "expanded" : ""
              }`}
            />
          </h3>
          <Collapse in={activeAccordion === "address"}>
            <div className="accordion-content">
              <Address />
            </div>
          </Collapse>
        </div>

        {/* Orders Accordion */}
        <div>
          <h3
            onClick={() => handleAccordionClick("order")}
            className="accordion-header"
          >
            Orders
            <ExpandMoreIcon
              className={`expand-icon ${
                activeAccordion === "order" ? "expanded" : ""
              }`}
            />
          </h3>
          <Collapse in={activeAccordion === "order"}>
            <div className="accordion-content">
              <Order />
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
}

export default Profile1;
