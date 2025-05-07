"use client";

import { Noir } from "@noir-lang/noir_js";
import circuit from "../circuits/zeropath/target/zeropath.json"; // Update path to your hidato circuit
import { CompiledCircuit } from "@noir-lang/noir_js";
import {generate_random_puzzle} from "../codegen/index"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { UltraHonkBackend } from "@aztec/bb.js";

// Types
type CellValue = number;
type GridRow = CellValue[];
type Grid = GridRow[];

interface Coordinate {
  row: number;
  col: number;
  value: number;
}

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
  verificationMessage: boolean;
  setVerificationMessage: (message: boolean) => void;
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

// Helper function to convert a 1D array to a 2D grid
const arrayToGrid = (array: number[], gridSize: number): Grid => {
  const grid: Grid = [];
  for (let i = 0; i < gridSize; i++) {
    const row: GridRow = [];
    for (let j = 0; j < gridSize; j++) {
      row.push(array[i * gridSize + j]);
    }
    grid.push(row);
  }
  return grid;
};

// Helper function to convert a 2D grid to a 1D array
const gridToArray = (grid: Grid): number[] => {
  return grid.flat();
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
  const [verificationMessage, setVerificationMessage] = useState<boolean>(false);
  const [placementHistory, setPlacementHistory] = useState<number[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [fixedPositions, setFixedPositions] = useState<
    { row: number; col: number; value: number }[]
  >([]);
  const [score, setScore] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  
  // Generate a new puzzle using the Noir circuit
  const generatePuzzleWithNoir = useCallback(async () => {
    try {
      setVerificationMessage(true);
      setIsVerifying(true);
      setError(null);
      const start = performance.now();

      // Instantiate the Noir circuit
      const noir = new Noir(circuit as CompiledCircuit);
      const randomness = Date.now().toString();

      const initializationTime = performance.now() - start;
     
      console.log("Circuit initialized in", initializationTime, "ms");
      // Execute the circuit in "generation mode" (mode = 0)
      const { witness } = await noir.execute({
        mode: 0,
        randomness: randomness,
        grid_size: gridSize,
        solution: Array(16).fill(0), // Placeholder, not used in generation mode
        fixed_positions: Array(4).fill({ row: 0, col: 0, value: 0 }) // Placeholder
      });

      const witnessTime = performance.now() - initializationTime;
      // console.log("Return value", returnValue);
      const backend = new UltraHonkBackend(circuit.bytecode);
      
      // Wait for the proof generation
      let {proof} = await backend.generateProof(witness);
      proof = proof.slice(4);

      console.log("Proof", proof);
      const provingTime = performance.now() - witnessTime;

      console.log(`Proving time: ${provingTime}ms`);
      
      const totalTime = performance.now() - start;
      console.log(`Total time: ${totalTime}ms`);

      // Extract the puzzle from the witness
      const puzzleOutput = await generate_random_puzzle(gridSize.toString(), randomness);
  
      const puzzleOutputDecimal = puzzleOutput.map((hex: string) => parseInt(hex, 16));
      const newPuzzle = arrayToGrid(puzzleOutputDecimal, gridSize);
      
      // Extract fixed positions from the generated puzzle
      const newFixedPositions: Coordinate[] = [];
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (newPuzzle[i][j] !== 0) {
            newFixedPositions.push({
              row: i,
              col: j,
              value: newPuzzle[i][j]
            });
          }
        }
      }
      
      // Update state with the generated puzzle and fixed positions
      setPuzzle(newPuzzle);
      setSolution(newPuzzle); // Initialize solution with the puzzle
      setFixedPositions(newFixedPositions);
      setIsVerifying(false);
      setVerificationMessage(false);
      
      console.log("Puzzle generated successfully", newPuzzle, newFixedPositions);
      
    } catch (error) {
      console.error("Error generating puzzle:", error);
      setIsVerifying(false);
      setVerificationMessage(false);
      setError("Failed to generate puzzle. Please try again.");
    }
  }, [gridSize]);

  // Generate a puzzle when the component mounts
  useEffect(() => {
    generatePuzzleWithNoir();
  }, [generatePuzzleWithNoir]);
  
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

  // Verify the solution using the Noir circuit
  const verifySimple = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    setVerificationMessage(true);

    try {
      const noir = new Noir(circuit as CompiledCircuit);
      
      console.log("Solution to verify", gridToArray(solution), fixedPositions);
      // Execute the circuit in "verification mode" (mode = 1)
      const { witness } = await noir.execute({
        mode: 1,
        randomness: "0", // Not used in verification mode
        grid_size: gridSize,
        solution: gridToArray(solution),
        fixed_positions: fixedPositions,
      });
      
      const backend = new UltraHonkBackend(circuit.bytecode);
      
      try {
        const proof = await backend.generateProof(witness);
        setIsVerifying(false);
        setIsVerified(true);
        setVerificationMessage(false);
        console.log(proof);
      } catch (error) {
        console.error("Error generating proof:", error);
        setVerificationMessage(false);
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
    setIsVerified(false);
    setError(null);
    setPlacementHistory([]);
    setSelectedNumber(null);
    setElapsedTime(0);
    setMistakeCount(0);
    setScore(0);
    
    // Generate a new puzzle
    generatePuzzleWithNoir();
  }, [generatePuzzleWithNoir]);

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
    verificationMessage,
    setVerificationMessage,
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