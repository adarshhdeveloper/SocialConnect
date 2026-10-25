import React from "react";
import { SocialProvider } from "./context/SocialContext";
import { Dashboard } from "./pages/Dashboard";

export function App() {
  return (
    <SocialProvider>
      <Dashboard />
    </SocialProvider>
  );
}

export default App;
