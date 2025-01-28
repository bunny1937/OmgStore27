import React, { useContext } from "react";
import { NetworkContext } from "./NetworkProvider";
import "./NetworkStatus.css";

const NetworkStatusBanner = () => {
  const isOnline = useContext(NetworkContext);

  if (!isOnline) {
    return (
      <div className="network-banner">
        <p>No Internet Connection. Please check your network and try again.</p>
      </div>
    );
  }

  return null;
};

export default NetworkStatusBanner;
