// BackButtonContext.js
import React, { createContext, useContext, useEffect, useRef } from "react";

const BackButtonContext = createContext();

export const BackButton = () => {
  return useContext(BackButtonContext);
};

export const BackButtonProvider = ({ children }) => {
  const backHandlerRef = useRef(null);

  const registerBackHandler = (handler) => {
    backHandlerRef.current = handler;
    window.addEventListener("popstate", backHandlerRef.current);
  };

  const unregisterBackHandler = (handler) => {
    window.removeEventListener("popstate", backHandlerRef.current);
  };

  useEffect(() => {
    return () => {
      if (backHandlerRef.current) {
        window.removeEventListener("popstate", backHandlerRef.current);
      }
    };
  }, []);

  return (
    <BackButtonContext.Provider
      value={{ registerBackHandler, unregisterBackHandler }}
    >
      {children}
    </BackButtonContext.Provider>
  );
};
