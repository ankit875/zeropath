import React from 'react';
import { HidatoProvider } from '../../context/HidatoContext';
import HidatoGrid from './HidatoGrid';
import GameControls from './GameControls';
import styles from './HidatoGame.module.css';

const HidatoGame: React.FC = () => {
  return (
    <HidatoProvider>
      <div className={styles.container}>
        <div className={styles.gameHeader}>
          <h1 className={styles.title}>ZeroPath</h1>
          <p className={styles.subtitle}>A Zero-Knowledge Hidato Puzzle</p>
        </div>
        
        <div className={styles.gameContent}>
          <HidatoGrid />
          <GameControls />
        </div>
        
        <div className={styles.gameFooter}>
          <p>
            <strong>Feature:</strong> This game integrated with Noir to generate zero-knowledge proofs, 
            allowing you to verify solutions without revealing them!
          </p>
        </div>
      </div>
    </HidatoProvider>
  );
};

export default HidatoGame;