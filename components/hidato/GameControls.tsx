import React from 'react';
import { useHidato } from '../../context/HidatoContext';
import styles from './GameControls.module.css';

const GameControls = () => {
  const { 
    verifySimple, 
    resetGame, 
    isVerified, 
    isVerifying, 
    error, 
    nextNumber,
    placementHistory,
    selectedNumber,
    removeNumber,
    fixedPositions,
  } = useHidato();

  const maxNumber = 16; // 4x4 grid

  // Get all placed numbers that can be removed (non-fixed numbers)
  const placedNumbers = placementHistory.filter(num => !isFixedNumber(num));

  // Check if a number is fixed (part of the initial puzzle)
  function isFixedNumber(num: number) {
    // Check if the number is in the fixed positions
    return fixedPositions.some(pos => pos.value === num);
  }

  return (
    <div className={styles.controls}>
      <div className={styles.nextNumberIndicator}>
        {selectedNumber ? (
          <div className={styles.repositionMode}>
            <span className={styles.repositionLabel}>Repositioning:</span>
            <span className={styles.nextValue}>{selectedNumber}</span>
            <button 
              className={styles.cancelButton}
              onClick={() => removeNumber(selectedNumber)}
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            {!isVerified && nextNumber <= maxNumber && (
              <>
                <span className={styles.nextLabel}>Next Number:</span>
                <span className={styles.nextValue}>{nextNumber}</span>
              </>
            )}
            {!isVerified && nextNumber > maxNumber && (
              <span className={styles.nextComplete}>All numbers placed!</span>
            )}
          </>
        )}
      </div>
      
      {placedNumbers.length > 0 && !isVerified && (
        <div className={styles.placedNumbers}>
          <div className={styles.placedNumbersTitle}>
            Placed Numbers:
            <span className={styles.placedHint}>(Right-click to reposition)</span>
          </div>
          <div className={styles.numbersList}>
            {placedNumbers.map(num => (
              <button 
                key={num}
                className={`${styles.placedNumber} ${selectedNumber === num ? styles.activeNumber : ''}`}
                onClick={() => removeNumber(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className={styles.buttonGroup}>
        <button 
          className={`${styles.button} ${styles.verifyButton}`}
          onClick={verifySimple}
          disabled={isVerified || isVerifying || nextNumber <= maxNumber}
        >
          {isVerifying ? 'Verifying...' : 'Verify Solution'}
        </button>
        <button 
          className={`${styles.button} ${styles.resetButton}`}
          onClick={resetGame}
          disabled={isVerifying}
        >
          Reset Game
        </button>
      </div>
      
      {isVerified && (
        <div className={styles.successMessage}>
          Congratulations! Your solution is valid.
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <div className={styles.note}>
        <p>
          <strong>Hidato Rules:</strong>
        </p>
        <ul>
          <li>The goal is to fill the grid with consecutive numbers from 1 to 16</li>
          <li>Numbers must form a continuous path where consecutive numbers are adjacent</li>
          <li>Adjacent means horizontally, vertically, or diagonally connected</li>
          <li>Some numbers are already placed as fixed clue points</li>
        </ul>
      </div>
    </div>
  );
};

export default GameControls;