// src/context/CampusContext.jsx
import { createContext, useState, useContext } from "react";

const CampusContext = createContext();

export function CampusProvider({ children }) {
  const [campus, setCampus] = useState(null);
  return (
    <CampusContext.Provider value={{ campus, setCampus }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  return useContext(CampusContext);
}
