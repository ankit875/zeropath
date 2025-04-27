import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
type CellValue = number;
type GridRow = CellValue[];
type Grid = GridRow[];
type Position = { row: number, col: number };

interface HidatoContextType {
  gridSize: number;
  puzzle: Grid;
  solution: Grid;
  isVerified: boolean;
  isVerifying: boolean;
  error: string | null;
  nextNumber: number;
  placementHistory: number[];
  selectedNumber: number | null;
  updateCell: (row: number, col: number) => void;
  removeNumber: (num: number) => void;
  selectNumber: (num: number) => void;
  getHint: () => Position | null;
  verifySimple: () => void;
  resetGame: () => void;
}

interface HidatoProviderProps {
  children: ReactNode;
}

// Example 4x4 Hidato puzzle
// 0 means empty cell that needs to be filled
// Numbers represent fixed clues
const initialPuzzle: Grid = [
  [1, 0, 0, 0],
  [0, 0, 8, 0],
  [0, 4, 0, 0],
  [0, 0, 0, 16]
];

// Create context with a default value
const HidatoContext = createContext<HidatoContextType | null>(null);

// Custom hook to use the Hidato context
export const useHidato = (): HidatoContextType => {
  const context = useContext(HidatoContext);
  if (!context) {
    throw new Error('useHidato must be used within a HidatoProvider');
  }
  return context;
};

// Provider component
export const HidatoProvider: React.FC<HidatoProviderProps> = ({ children }) => {
  const gridSize = 4;
  
  // State
  const [puzzle] = useState<Grid>([...initialPuzzle.map(row => [...row])]);
  const [solution, setSolution] = useState<Grid>([...initialPuzzle.map(row => [...row])]);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [placementHistory, setPlacementHistory] = useState<number[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  
  // Find the next number to be placed
  const findNextNumber = useCallback((): number => {
    const flatSolution = solution.flat();
    const maxNum = gridSize * gridSize;
    
    // Start checking from 2 since 1 is always the first number
    for (let i = 2; i <= maxNum; i++) {
      if (!flatSolution.includes(i)) {
        return i;
      }
    }
    
    // If all numbers are placed, return maxNum + 1 (which is invalid)
    return maxNum + 1;
  }, [solution, gridSize]);
  
  const nextNumber = findNextNumber();
  
  // Select a number for removal or repositioning
  const selectNumber = useCallback((num: number): void => {
    // Only allow selecting numbers that were manually placed
    if (num <= 1 || findNumberInPuzzle(puzzle, num)) {
      return;
    }
    
    setSelectedNumber(prev => prev === num ? null : num);
  }, [puzzle]);
  
  // Update a cell with a number
  const updateCell = useCallback((row: number, col: number): void => {
    // Don't update if it's a fixed clue
    if (puzzle[row][col] !== 0) {
      return;
    }
    
    // If there's a selected number to reposition
    if (selectedNumber !== null) {
      // Remove the selected number from its current position
      setSolution(prevSolution => {
        const newSolution = prevSolution.map(r => [...r]);
        // Find and clear the cell where the selected number is
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            if (newSolution[r][c] === selectedNumber) {
              newSolution[r][c] = 0;
              break;
            }
          }
        }
        
        // Place the selected number in the new position
        newSolution[row][col] = selectedNumber;
        return newSolution;
      });
      
      // Clear selection after moving
      setSelectedNumber(null);
      return;
    }
    
    // Don't update if the cell already has a value
    if (solution[row][col] !== 0) {
      return;
    }
    
    // Find the next available number to place
    const next = findNextNumber();
    
    // Check if we've already placed all numbers
    const maxNum = gridSize * gridSize;
    if (next > maxNum) {
      setError("All numbers have already been placed");
      return;
    }
    
    // Only allow placing the next number if it's adjacent to the previous number
    // EXCEPT for the first placement after the starting number (2 can be placed anywhere initially)
    if (next > 2) {
      const flatSolution = solution.flat();
      const prevNumPos = findPosition(flatSolution, next - 1);
      const prevRow = Math.floor(prevNumPos / gridSize);
      const prevCol = prevNumPos % gridSize;
      
      const rowDiff = Math.abs(row - prevRow);
      const colDiff = Math.abs(col - prevCol);
      
      // Check if adjacent (horizontally, vertically, or diagonally)
      if (rowDiff > 1 || colDiff > 1) {
        setError(`Number ${next} must be adjacent to ${next - 1}`);
        return;
      }
    }
    
    // Clear any previous errors
    setError(null);
    
    // Update the solution with the next number
    setSolution(prevSolution => {
      const newSolution = prevSolution.map(r => [...r]);
      newSolution[row][col] = next;
      return newSolution;
    });
    
    // Add to placement history
    setPlacementHistory(prev => [...prev, next]);
  }, [puzzle, solution, gridSize, findNextNumber, selectedNumber]);
  
  // Remove a number from the solution
  const removeNumber = useCallback((num: number): void => {
    // Don't allow removing fixed clues
    if (findNumberInPuzzle(puzzle, num)) {
      return;
    }
    
    // Find and remove the number
    setSolution(prevSolution => {
      const newSolution = prevSolution.map(r => [...r]);
      
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (newSolution[r][c] === num) {
            newSolution[r][c] = 0;
            break;
          }
        }
      }
      
      return newSolution;
    });
    
    // Remove from placement history
    setPlacementHistory(prev => prev.filter(n => n !== num));
    
    // Clear any selection
    if (selectedNumber === num) {
      setSelectedNumber(null);
    }
    
    // Clear any error
    setError(null);
  }, [puzzle, gridSize, selectedNumber]);
  
  // Helper function to check if a number exists in the puzzle (fixed clue)
  const findNumberInPuzzle = (puzzleGrid: Grid, num: number): boolean => {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (puzzleGrid[r][c] === num) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Hint system - find a valid position for the next number
  const getHint = useCallback((): Position | null => {
    const next = findNextNumber();
    const maxNum = gridSize * gridSize;
    
    // If all numbers placed, no hint available
    if (next > maxNum) {
      return null;
    }
    
    // For the number 2, any empty cell is valid initially
    if (next === 2) {
      // Find the first empty cell
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (solution[r][c] === 0) {
            return { row: r, col: c };
          }
        }
      }
      return null;
    }
    
    // For other numbers, find a valid adjacent cell to the previous number
    const flatSolution = solution.flat();
    const prevNumPos = findPosition(flatSolution, next - 1);
    const prevRow = Math.floor(prevNumPos / gridSize);
    const prevCol = prevNumPos % gridSize;
    
    // Check all adjacent cells
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue; // Skip the cell itself
        
        const r = prevRow + dr;
        const c = prevCol + dc;
        
        // Check if within grid bounds
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          // Check if the cell is empty
          if (solution[r][c] === 0) {
            return { row: r, col: c };
          }
        }
      }
    }
    
    // No valid hint found
    return null;
  }, [solution, gridSize, findNextNumber]);
  
  // Verification method
  const verifySimple = useCallback((): void => {
    setIsVerifying(true);
    setError(null);
    
    const flatSolution = solution.flat();
    const maxNum = gridSize * gridSize;
    
    // Check if all cells are filled
    if (flatSolution.includes(0)) {
      setIsVerifying(false);
      setIsVerified(false);
      setError("Not all cells are filled");
      return;
    }
    
    // Check all numbers from 1 to maxNum are present
    const used = Array(maxNum + 1).fill(false);
    for (let i = 0; i < flatSolution.length; i++) {
      const num = flatSolution[i];
      if (num < 1 || num > maxNum || used[num]) {
        setIsVerifying(false);
        setIsVerified(false);
        setError(`Invalid value: ${num} (duplicate or out of range)`);
        return;
      }
      used[num] = true;
    }
    
    // Check consecutive numbers are adjacent
    for (let num = 1; num < maxNum; num++) {
      const pos1 = findPosition(flatSolution, num);
      const pos2 = findPosition(flatSolution, num + 1);
      
      const row1 = Math.floor(pos1 / gridSize);
      const col1 = pos1 % gridSize;
      const row2 = Math.floor(pos2 / gridSize);
      const col2 = pos2 % gridSize;
      
      const rowDiff = Math.abs(row1 - row2);
      const colDiff = Math.abs(col1 - col2);
      
      // Check if adjacent (horizontally, vertically, or diagonally)
      if (rowDiff > 1 || colDiff > 1) {
        setIsVerifying(false);
        setIsVerified(false);
        setError(`Numbers ${num} and ${num + 1} are not adjacent`);
        return;
      }
    }
    
    // If we get here, the solution is valid
    setIsVerifying(false);
    setIsVerified(true);
  }, [solution, gridSize]);
  
  // Reset game
  const resetGame = useCallback((): void => {
    setSolution([...initialPuzzle.map(row => [...row])]);
    setIsVerified(false);
    setError(null);
    setPlacementHistory([]);
    setSelectedNumber(null);
  }, []);
  
  // Context value
  const value: HidatoContextType = {
    gridSize,
    puzzle,
    solution,
    isVerified,
    isVerifying,
    error,
    nextNumber,
    placementHistory,
    selectedNumber,
    updateCell,
    removeNumber,
    selectNumber,
    getHint,
    verifySimple,
    resetGame
  };
  
  return (
    <HidatoContext.Provider value={value}>
      {children}
    </HidatoContext.Provider>
  );
};

// Helper function to find position of a number in the flattened array
function findPosition(flatArray: number[], num: number): number {
  return flatArray.findIndex(val => val === num);
}