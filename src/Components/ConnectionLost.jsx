import React from "react";
import connectionLost from "../assets/internetlost.png";
const ConnectionLost = () => {
  return (
    <div className="flex items-center flex-col justify-center gap-4">
      <img src={connectionLost} alt="connection-img" className="h-60" />
      <h1 className="text-primary text-secondarySize font-bold">
        Please Check your internet
      </h1>
      <button className="bg-subPrimary text-primary text-mediumSize font-semibold rounded-md py-1 px-4">
        Refresh
      </button>
    </div>
  );
};

export default ConnectionLost;
