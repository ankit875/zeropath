import React from "react";
import { HidatoProvider } from "../../context/HidatoContext";
import HidatoHomePage from "./HidatoHomePage";

const HidatoGame: React.FC = () => {
  return (
    <HidatoProvider>
      <HidatoHomePage />
    </HidatoProvider>
  );
};

export default HidatoGame;
