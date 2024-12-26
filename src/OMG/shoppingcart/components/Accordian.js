import React, { useState } from "react";
import "./Accordian.css";
import { RiAddLine } from "react-icons/ri";

const Accordion = () => {
  const [accActive, setAccActive] = useState();

  let accordionData = [
    {
      title: "Details",
      accordionContent:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      title: "Description",
      accordionContent:
        "Sample-text,Sample-text,Sample-text,Sample-text,Sample-text",
    },
    {
      title: "Extra",
      accordionContent: "Fortamet,Glumetza",
    },
  ];

  const handleActive = (index) => {
    if (accActive === index) {
      setAccActive();
    } else {
      setAccActive(index);
    }
  };

  return (
    <>
      <div className="accordionContainer">
        {accordionData.map((acc, index) => {
          const contentItems = acc.accordionContent.split(",");
          return (
            <div className="accordion" onClick={() => handleActive(index)}>
              <div className="accordionHeading">
                <span
                  className="addIcon"
                  style={{
                    transform: `${
                      accActive === index ? "rotate(45deg)" : "rotate(0deg)"
                    }`,
                  }}
                >
                  <RiAddLine size={25} />
                </span>
                <h3>{acc.title}</h3>
              </div>
              {accActive === index ? (
                <div className="accordionContent">
                  <ul>
                    {contentItems.map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Accordion;
