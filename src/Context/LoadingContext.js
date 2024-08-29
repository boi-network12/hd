// src/context/LoadingContext.js
import React, { createContext, useState } from 'react';

// Create the context
export const LoadingContext = createContext();

// Create the provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && <Loading />}
    </LoadingContext.Provider>
  );
};

const Loading = () => (
  <div className="loadingContainer">
    <div className="loadingText">KAMDI DEV</div>
  </div>
);

export default LoadingProvider;
