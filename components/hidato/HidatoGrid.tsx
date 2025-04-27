import React, { useState } from 'react';
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
    getHint
  } = useHidato();
  
  const [hintCell, setHintCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellClick = (row: number, col: number) => {
    // Don't allow clicks on fixed cells or when puzzle is verified
    if (puzzle[row][col] !== 0 || isVerified) {
      return;
    }
    
    // Update the cell with the selected or next consecutive number
    updateCell(row, col);
    
    // Clear any hint
    setHintCell(null);
  };
  
  const handleShowHint = () => {
    const hint = getHint();
    if (hint) {
      setHintCell(hint);
      // Auto-clear hint after 3 seconds
      setTimeout(() => setHintCell(null), 3000);
    }
  };
  
  const handleCellRightClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, row: number, col: number, value: number) => {
    event.preventDefault(); // Prevent default context menu
    
    // Only allow selecting non-fixed numbers
    if (value > 1 && puzzle[row][col] === 0) {
      selectNumber(value);
    }
    
    return false;
  };

  return (
    <div 
      className={classNames(styles.grid, { [styles.verified]: isVerified })}
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
    >
      {Array.from({ length: gridSize }).map((_, rowIndex) => (
        Array.from({ length: gridSize }).map((_, colIndex) => {
          const isFixed = puzzle[rowIndex][colIndex] !== 0;
          const cellValue = solution[rowIndex][colIndex] || '';
          const cellKey = `cell-${rowIndex}-${colIndex}`;
          const isHintCell = hintCell && hintCell.row === rowIndex && hintCell.col === colIndex;
          const isSelected = cellValue !== '' && cellValue === selectedNumber;
          
          return (
            <div 
              key={cellKey}
              className={classNames(styles.cell, {
                [styles.fixed]: isFixed,
                [styles.filled]: !isFixed && cellValue !== '',
                [styles.clickable]: !isFixed && !isVerified,
                [styles.next]: !isFixed && !isVerified && cellValue === '' && nextNumber > 1,
                [styles.hintCell]: isHintCell,
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
      
      <button 
        className={styles.hintButton} 
        onClick={handleShowHint}
        disabled={isVerified || nextNumber > gridSize * gridSize}
      >
        <span>💡</span>
      </button>
    </div>
  );
};

export default HidatoGrid;