import React, { useState, useEffect } from 'react';
import { useHidato } from '../../context/HidatoContext';
import classNames from 'classnames';
import styles from './HidatoGrid.module.css';

const HidatoGrid = () => {
  const { 
    puzzle, 
    solution, 
    gridSize, 
    updateCell, 
    isVerified, 
    nextNumber,
    selectedNumber,
    selectNumber,
    score,
    startTimer,
    elapsedTime,
    markMistake,
    mistakeCount,
    resetGame,
    verificationMessage,
    gameInitialized, // Added this to check if game is initialized
  } = useHidato();

  // Local state for timing display
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [previousScore, setPreviousScore] = useState(score);

  // Update timer display
  useEffect(() => {
    if (elapsedTime !== undefined) {
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      setTimerDisplay(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
  }, [elapsedTime]);

  // Start the timer when component mounts (only if game is initialized)
  useEffect(() => {
    if (gameInitialized) {
      startTimer();
    }
  }, [gameInitialized, startTimer]);

  // Track score changes for animation
  useEffect(() => {
    if (score !== previousScore) {
      setScoreChange(score - previousScore);
      setPreviousScore(score);
      
      const timer = setTimeout(() => {
        setScoreChange(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [score, previousScore]);

  // Calculate detailed score breakdown
  const calculateScoreBreakdown = () => {
    const baseScore = 1000;
    const timePenalty = Math.min(baseScore, elapsedTime * 2);
    const mistakePenalty = mistakeCount * 50;
    const sizeBonus = (gridSize - 3) * 100;
    
    return {
      baseScore,
      timePenalty,
      mistakePenalty,
      sizeBonus,
      finalScore: Math.max(0, baseScore - timePenalty - mistakePenalty + sizeBonus)
    };
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameInitialized) {
      return;
    }
    
    if (puzzle[row][col] !== 0 || isVerified) {
      return;
    }
    
    if (solution[row][col] !== 0 && solution[row][col] !== null) {
      markMistake();
    }
    
    updateCell(row, col);
  };
  
  const handleCellRightClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, row: number, col: number, value: number) => {
    event.preventDefault();
    
    if (!gameInitialized) {
      return false;
    }
    
    if (value > 1 && puzzle[row][col] === 0) {
      if (solution[row][col] !== 0 && solution[row][col] !== null) {
        markMistake();
      }
      
      selectNumber(value);
    }
    
    return false;
  };


  if (!gameInitialized) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.placeholderGrid}>
          <div className={verificationMessage ? `${styles.placeholderMessage} ${styles.loadingMessage}` : styles.placeholderMessage}>
            {verificationMessage && <div className={styles.spinner}></div>}
            {verificationMessage ? "Generating puzzle, please wait..." : "Click \"Join Tournament\" to start the game!"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Time</span>
          <span className={`${styles.statValue} ${styles.timer}`}>{timerDisplay}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Score</span>
          <span className={`${styles.statValue} ${styles.scoreValue}`}>
            {score}
            {scoreChange !== null && (
              <span className={styles.scoreChange}>
                {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
              </span>
            )}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Mistakes</span>
          <span className={`${styles.statValue} ${styles.mistakeCounter}`}>{mistakeCount}</span>
        </div>
      </div>
      
      {verificationMessage && (
      <div className={styles.verificationMessage}>
          Proof is Generating...
        </div>
      )}
      {/* Grid */}
      <div 
        className={classNames(styles.grid, { [styles.verified]: isVerified })}
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {Array.from({ length: gridSize }).map((_, rowIndex) => (
          Array.from({ length: gridSize }).map((_, colIndex) => {
            const isFixed = puzzle[rowIndex][colIndex] !== 0;
            const cellValue = solution[rowIndex][colIndex] || '';
            const cellKey = `cell-${rowIndex}-${colIndex}`;
            const isSelected = cellValue !== '' && cellValue === selectedNumber;
            
            return (
              <div 
                key={cellKey}
                className={classNames(styles.cell, {
                  [styles.fixed]: isFixed,
                  [styles.filled]: !isFixed && cellValue !== '',
                  [styles.clickable]: !isFixed && !isVerified,
                  [styles.next]: !isFixed && !isVerified && cellValue === '' && nextNumber > 1,
                  [styles.selected]: isSelected
                })}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex, typeof cellValue === 'number' ? cellValue : 0)}
              >
                <div className={styles.cellContent}>
                  {cellValue}
                  {!isFixed && !isVerified && cellValue === '' && selectedNumber === null && 
                    <div className={styles.hoverIndicator}>{nextNumber}</div>
                  }
                  {!isFixed && !isVerified && cellValue === '' && selectedNumber !== null && 
                    <div className={styles.hoverIndicator}>{selectedNumber}</div>
                  }
                </div>
                {isSelected && (
                  <div className={styles.selectedIndicator}>
                    <div className={styles.selectionRing}></div>
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
      
      <div className={styles.gameControls}>
        {isVerified && (
          <div className={styles.completionMessage}>
            <h3>Puzzle Completed!</h3>
            <p>You solved it in {timerDisplay}</p>
            
            <div className={styles.scoreDetails}>
              {(() => {
                const breakdown = calculateScoreBreakdown();
                return (
                  <>
                    <div>
                      <span>Base Score:</span>
                      <span>{breakdown.baseScore}</span>
                    </div>
                    <div>
                      <span>Time Penalty:</span>
                      <span>-{breakdown.timePenalty}</span>
                    </div>
                    <div>
                      <span>Mistake Penalty:</span>
                      <span>-{breakdown.mistakePenalty}</span>
                    </div>
                    <div>
                      <span>Grid Size Bonus:</span>
                      <span>+{breakdown.sizeBonus}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', marginTop: '8px' }}>
                      <span>Final Score:</span>
                      <span>{breakdown.finalScore}</span>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <button 
              className={styles.resetButton}
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HidatoGrid;