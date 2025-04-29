export const generateRandomPuzzle = (gridSize: number): { 
    puzzle: number[][];
    fixedPositions: {row: number; col: number, value: number}[];
  } => {
    // Create an empty puzzle
    const puzzle = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    const solution = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    
    // Arrays to collect fixed values and their positions
    const fixedPositions: {row: number; col: number, value: number}[] = [];
    
    // First, generate a valid complete solution
    
    // Place 1 at a random position
    const startRow = Math.floor(Math.random() * gridSize);
    const startCol = Math.floor(Math.random() * gridSize);
    solution[startRow][startCol] = 1;
    
    // Build a valid path from 1 to gridSize^2
    let currentNum = 1;
    let currentRow = startRow;
    let currentCol = startCol;
    
    while (currentNum < gridSize * gridSize) {
      // Find available adjacent cells
      const adjacentCells = [];
      
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          
          const newRow = currentRow + dr;
          const newCol = currentCol + dc;
          
          if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && 
              solution[newRow][newCol] === 0) {
            adjacentCells.push([newRow, newCol]);
          }
        }
      }
      
      // If no adjacent cells are available, the path is stuck
      if (adjacentCells.length === 0) {
        // Restart the generation
        return generateRandomPuzzle(gridSize);
      }
      
      // Pick a random adjacent cell
      const [nextRow, nextCol] = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
      currentNum++;
      solution[nextRow][nextCol] = currentNum;
      currentRow = nextRow;
      currentCol = nextCol;
    }
    
    // Now create the puzzle with clues
    
    // Collect all clues first
    const clues: {value: number, row: number, col: number}[] = [];
    
    // Add 1 and gridSize^2 as required clues
    clues.push({value: 1, row: startRow, col: startCol});
    
    // Find the position of the maximum number
    let endRow = -1, endCol = -1;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (solution[r][c] === gridSize * gridSize) {
          endRow = r;
          endCol = c;
        }
      }
    }
    
    clues.push({value: gridSize * gridSize, row: endRow, col: endCol});
    
    // Add additional clues randomly from the solution
    const additionalClues = 2; // 2 additional clues
    
    // Create array of possible values (2 to gridSize^2-1)
    const possibleValues = Array.from(
      { length: gridSize * gridSize - 2 }, 
      (_, i) => i + 2
    );
    
    // Shuffle the array
    for (let i = possibleValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [possibleValues[i], possibleValues[j]] = [possibleValues[j], possibleValues[i]];
    }
    
    // Take the first few values as clues
    for (let i = 0; i < Math.min(additionalClues, possibleValues.length); i++) {
      const value = possibleValues[i];
      
      // Find this value in the solution
      let found = false;
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (solution[r][c] === value) {
            clues.push({value, row: r, col: c});
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
    
    // Sort clues by value to ensure consistent indexing
    clues.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });
    
    // Now build the puzzle and parallel arrays from the sorted clues
    for (const {value, row, col} of clues) {
      puzzle[row][col] = value;
      fixedPositions.push({row, col, value});
    }
  
    // Return the puzzle and the arrays of fixed values and positions
    return { puzzle, fixedPositions };
  };