"use client";

import { Noir } from "@noir-lang/noir_js";
import circuit from "../circuits/target/circuits.json";
import { CompiledCircuit } from "@noir-lang/noir_js";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { UltraHonkBackend } from "@aztec/bb.js";
import { generateRandomPuzzle } from "utils/utils";

// Types
type CellValue = number;
type GridRow = CellValue[];
type Grid = GridRow[];

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
  fixedPositions: { row: number; col: number; value: number }[];
  updateCell: (row: number, col: number) => void;
  removeNumber: (num: number) => void;
  selectNumber: (num: number) => void;
  verifySimple: () => void;
  resetGame: () => void;
  score: number;
  setScore: (score: number) => void;
  elapsedTime: number;
  startTimer: () => void;
  pauseTimer: () => void;
  mistakeCount: number;
  markMistake: () => void;
}

interface HidatoProviderProps {
  children: ReactNode;
}

// Create context with a default value
const HidatoContext = createContext<HidatoContextType | null>(null);

// Custom hook to use the Hidato context
export const useHidato = (): HidatoContextType => {
  const context = useContext(HidatoContext);
  if (!context) {
    throw new Error("useHidato must be used within a HidatoProvider");
  }
  return context;
};

// Provider component
export const HidatoProvider: React.FC<HidatoProviderProps> = ({ children }) => {
  const gridSize = 4;
  // State
  const [puzzle, setPuzzle] = useState<Grid>(() =>
    Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(0))
  );
  const [solution, setSolution] = useState<Grid>(() =>
    Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(0))
  );
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [placementHistory, setPlacementHistory] = useState<number[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [fixedPositions, setFixedPositions] = useState<
    { row: number; col: number; value: number }[]
  >([]);
  const [score, setScore] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [mistakeCount, setMistakeCount] = useState<number>(0);

  useEffect(() => {
    const { puzzle: initialPuzzle, fixedPositions } =
      generateRandomPuzzle(gridSize);
    console.log("Fixed positions:", fixedPositions);
    setPuzzle(initialPuzzle);
    setFixedPositions(fixedPositions);
    setSolution(initialPuzzle);
  }, [gridSize]);

  // Add timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive && !isVerified) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, isVerified]);

  // Timer control functions
  const startTimer = useCallback(() => {
    setTimerActive(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerActive(false);
  }, []);

  // Track mistakes
  const markMistake = useCallback(() => {
    setMistakeCount((prev) => prev + 1);
  }, []);

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
  const selectNumber = useCallback(
    (num: number): void => {
      // Only allow selecting numbers that were manually placed
      if (num <= 1 || findNumberInPuzzle(puzzle, num)) {
        return;
      }

      setSelectedNumber((prev) => (prev === num ? null : num));
    },
    [puzzle]
  );

  // Update a cell with a number
  const updateCell = useCallback(
    (row: number, col: number): void => {
      // Don't update if it's a fixed clue
      if (puzzle[row][col] !== 0) {
        return;
      }

      // If there's a selected number to reposition
      if (selectedNumber !== null) {
        // Remove the selected number from its current position
        setSolution((prevSolution) => {
          const newSolution = prevSolution.map((r) => [...r]);
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
      setSolution((prevSolution) => {
        const newSolution = prevSolution.map((r) => [...r]);
        newSolution[row][col] = next;
        return newSolution;
      });

      // Add to placement history
      setPlacementHistory((prev) => [...prev, next]);
    },
    [puzzle, solution, gridSize, findNextNumber, selectedNumber]
  );

  // Remove a number from the solution
  const removeNumber = useCallback(
    (num: number): void => {
      // Don't allow removing fixed clues
      if (findNumberInPuzzle(puzzle, num)) {
        return;
      }

      // Find and remove the number
      setSolution((prevSolution) => {
        const newSolution = prevSolution.map((r) => [...r]);

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
      setPlacementHistory((prev) => prev.filter((n) => n !== num));

      // Clear any selection
      if (selectedNumber === num) {
        setSelectedNumber(null);
      }

      // Clear any error
      setError(null);
    },
    [puzzle, gridSize, selectedNumber]
  );

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

  // Verification method
  // const verifySimple = useCallback(async () => {
  //   setIsVerifying(true);
  //   setError(null);

  //   const noir = new Noir(circuit as CompiledCircuit);
  //   const { witness } = await noir.execute({
  //     solution: solution.flat(),
  //     grid_size: gridSize,
  //     fixed_positions: fixedPositions,
  //   });
  //   const backend = new UltraHonkBackend(circuit.bytecode);
  //   try {
  //     const proof = await backend.generateProof(witness);
  //     setIsVerifying(false);
  //     setIsVerified(true);
  //     console.log(proof);
  //   } catch (error) {
  //     console.error("Error generating proof:", error);
  //     setIsVerifying(false);
  //     setIsVerified(false);
  //     // Enable reset game button by setting error state
  //     setError("Verification failed. Please reset the game.");
  //   }

    
  // }, [solution, fixedPositions]);

  const verifySimple = useCallback(async () => {
    setIsVerifying(true);
    setError(null);

    try {
      const noir = new Noir(circuit as CompiledCircuit);
      const { witness } = await noir.execute({
        solution: solution.flat(),
        grid_size: gridSize,
        fixed_positions: fixedPositions,
      });
      
      const backend = new UltraHonkBackend(circuit.bytecode);
      
      try {
        const proof = await backend.generateProof(witness);
        setIsVerifying(false);
        setIsVerified(true);
        console.log(proof);
      } catch (error) {
        console.error("Error generating proof:", error);
        setIsVerifying(false);
        setIsVerified(false);
        
        // More specific error message with guidance
        setError("Verification failed. Your solution appears to be incorrect. Please check your number path and try again.");
        
        // Mark as mistake
        markMistake();
      }
    } catch (error) {
      console.error("Error executing circuit:", error);
      setIsVerifying(false);
      setIsVerified(false);
      setError("There was a problem verifying your solution. Proof generation failed.");
    }
  }, [solution, fixedPositions, gridSize, markMistake]);
  // Reset game
  const resetGame = useCallback((): void => {
    const { puzzle: initialPuzzle, fixedPositions } =
      generateRandomPuzzle(gridSize);
    setSolution(initialPuzzle);
    setPuzzle(initialPuzzle);
    setFixedPositions(fixedPositions);
    setIsVerified(false);
    setError(null);
    setPlacementHistory([]);
    setSelectedNumber(null);
    setElapsedTime(0);
    setMistakeCount(0);
    setScore(0);
  }, [gridSize]);

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
    fixedPositions,
    updateCell,
    removeNumber,
    selectNumber,
    verifySimple,
    resetGame,
    score,
    setScore,
    elapsedTime,
    startTimer,
    pauseTimer,
    mistakeCount,
    markMistake,
  };

  return (
    <HidatoContext.Provider value={value}>{children}</HidatoContext.Provider>
  );
};

// Helper function to find position of a number in the flattened array
function findPosition(flatArray: number[], num: number): number {
  return flatArray.findIndex((val) => val === num);
}
