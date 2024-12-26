// useBackButtonHandler.js
import { useEffect } from "react";
import { BackButton } from "./BackContext"; // Adjust the path to the BackButtonContext file.

const BackButtonHandler = (onClose) => {
  const { registerBackHandler, unregisterBackHandler } = BackButton();

  useEffect(() => {
    registerBackHandler(onClose); // Register the handler
    return () => unregisterBackHandler(onClose); // Cleanup on unmount
  }, [onClose, registerBackHandler, unregisterBackHandler]);
};

export default BackButtonHandler;
