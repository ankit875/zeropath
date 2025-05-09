import React from "react";
import { useHidato } from "../../context/HidatoContext";
import styles from "./GameControls.module.css";

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
    gameInitialized, 
    verificationMessage,
  } = useHidato();

  const maxNumber = 16; // 4x4 grid

  const placedNumbers = placementHistory.filter((num) => !isFixedNumber(num));

  function isFixedNumber(num: number) {
    return fixedPositions.some((pos) => pos.value === num);
  }

  if (!gameInitialized) {
    return (
      <div className={styles.controls}>
        <div className={styles.note}>
          <h3>Hidato Rules</h3>
          <ul className="rules-list">
            <li className="rule-item">
              <svg
                className="check-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Fill in the grid with consecutive numbers
            </li>
            <li className="rule-item">
              <svg
                className="check-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Each number must be adjacent to the previous and next number
            </li>
            <li className="rule-item">
              <svg
                className="check-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Complete the puzzle as quickly as possible to earn more points
            </li>
          </ul>
          
          <div className={verificationMessage ? `${styles.controlsPlaceholder} ${styles.loadingMessage}` : styles.controlsPlaceholder}>
            {verificationMessage ? (
              <>
                <div className={styles.spinner}></div>
                <p>Generating puzzle, please wait...</p>
              </>
            ) : (
              <p>Join a tournament to start playing!</p>
            )}
          </div>
        </div>
      </div>
    );
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
            <span className={styles.placedHint}>
              (Right-click to reposition)
            </span>
          </div>
          <div className={styles.numbersList}>
            {placedNumbers.map((num) => (
              <button
                key={num}
                className={`${styles.placedNumber} ${
                  selectedNumber === num ? styles.activeNumber : ""
                }`}
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
          {isVerifying ? "Verifying..." : "Verify Solution"}
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

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.note}>
        <p>
          <strong>Hidato Rules:</strong>
        </p>
        <ul className="rules-list">
          <li className="rule-item">
            <svg
              className="check-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Complete puzzles to earn points
          </li>
          <li className="rule-item">
            <svg
              className="check-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Score based on completion time and accuracy
          </li>
          <li className="rule-item">
            <svg
              className="check-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Top players receive coin rewards
          </li>
          <li className="rule-item">
            <svg
              className="check-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Special badges for consistent winners
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GameControls;