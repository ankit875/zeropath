import HidatoHomePage from "./HidatoHomePage";
import React from 'react';
import { HidatoProvider } from '../../context/HidatoContext';

const HidatoGame: React.FC = () => {
  return (
    <HidatoProvider>
      <HidatoHomePage />
    </HidatoProvider>
  );
};

export default HidatoGame;
