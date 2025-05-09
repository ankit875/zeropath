// Hidato puzzle generator and verifier
// This circuit both generates random Hidato puzzles and verifies solutions

// Define a struct to hold coordinates
struct Coordinate {
    row: u32,
    col: u32,
    value: u32,
}

// Main function - combines generation and verification
fn main(
    mode: pub u32,       // 0 = generate puzzle, 1 = verify solution
    randomness: Field,   // Randomness source for puzzle generation
    grid_size: pub u32,  // Size of the grid (assuming square grid)
    solution: pub [u32; 16],       // Flattened 1D array of the solution (for verification)
    fixed_positions: [Coordinate; 4] // Coordinates of fixed numbers (for verification)
) -> pub [u32; 16] {

    if mode == 0 {
        let puzzle = generate_random_puzzle(grid_size as u8, randomness);
        
        puzzle
    } else {
        let result = verify_solution(grid_size, solution, fixed_positions);
        
        if result {
            solution
        } else {
            [0; 16]
        }
    }
}

// Function to verify a solution is valid
fn verify_solution(
    grid_size: u32,            
    solution: [u32; 16],       
    fixed_positions: [Coordinate; 4] 
) -> bool {
    // Verify that the fixed positions in the solution match the given fixed values
    for i in 0..4 {
        let row = fixed_positions[i].row;
        let col = fixed_positions[i].col;
        let expected_value = fixed_positions[i].value;
        let index = row * grid_size + col;
        
        // Cast to integers before comparison or ensure index is within bounds
        let index_u32 = index as u32;
        assert(index_u32 < 16, "Fixed position out of bounds");
        assert(solution[index_u32] == expected_value, "Solution doesn't match fixed value");
    }
    
    // Check that all numbers from 1 to 16 appear exactly once
    let mut found = [false; 16];
    
    for i in 0..16 {
        let value: u32 = solution[i];
        
        let is_in_range: bool = (value >= 1) & (value <= 16);
        assert(is_in_range, "Value out of range");
        
        // Check for duplicates
        let value_index: u32 = (value - 1);
        assert(!found[value_index], "Duplicate value found");
        found[value_index] = true;
    }
    
    // Verify all numbers are used
    for i in 0..16 {
        assert(found[i], "Missing value");
    }
    
    // Verify connectedness of consecutive numbers
    for num in 1..16 {
        // Find positions of current number and next number
        let mut current_row = 0;
        let mut current_col = 0;
        let mut next_row = 0;
        let mut next_col = 0;
        let mut found_current = false;
        let mut found_next = false;
        
        // Use fixed integers for loops instead of u32
        for r in 0..4 {
            for c in 0..4 {
                let index = (r * 4 + c) as u32;
                
                if (solution[index] as u32) == (num as u32) {
                    current_row = r as u32;
                    current_col = c as u32;
                    found_current = true;
                }
                
                if (solution[index] as u32) == ((num + 1) as u32) {
                    next_row = r as u32;
                    next_col = c as u32;
                    found_next = true;
                }
            }
        }
        
        assert(found_current, "Number not found in grid");
        assert(found_next, "Next consecutive number not found in grid");
        
        // Calculate the distance between positions
        let row_diff = abs_diff(current_row, next_row);
        let col_diff = abs_diff(current_col, next_col);
        
        // Check that consecutive numbers are adjacent (horizontally, vertically, or diagonally)
        let row_diff_int = row_diff as u32;
        let col_diff_int = col_diff as u32;
        assert((row_diff_int <= 1) & (col_diff_int <= 1), "Consecutive numbers must be adjacent");
        
        // Also ensure they're not the same position
        let not_same_position = (row_diff_int > 0) | (col_diff_int > 0);
        assert(not_same_position, "Consecutive numbers cannot be at the same position");
    }
    
    // If all checks pass, return true
    true
}

// Convert a field element to random u16 values
fn convert_scalar_into_random_u16s<let N: u32>(input_randomness: Field) -> [u16; N] {
    let mut r: [u16; N] = [0; N];
    
    let bytes: [u8; 32] = input_randomness.to_be_bytes();
    
    for i in 0..N {
        let idx1 = (i * 2) % 32;
        let idx2 = (i * 2 + 1) % 32;
        let digit = bytes[idx1] as u16 + (bytes[idx2] as u16) * 256;
        
        let modulus = (i + 1) as u16;
        r[i] = digit % modulus;
    }
    
    r
}


// Generates a random number path puzzle
#[export]
pub fn generate_random_puzzle(grid_size: u8, randomness: Field) -> [u32; 16] {
    assert(grid_size == 4, "This implementation only supports 4x4 grids");
    
    let random_values = convert_scalar_into_random_u16s::<50>(randomness);
    
    let mut solution: [u32; 16] = [0; 16];
    
    let start_idx = (random_values[0] % 16) as u8;
    solution[start_idx] = 1;
    
    let mut current_idx = start_idx;
    let mut current_num: i8 = 1;
    
    let directions: [i8; 8] = [-4, 1, 4, -1, -5, -3, 5, 3];
    
    for _ in current_num..16 {
        let mut adjacent_cells: [u8; 8] = [255; 8]; 
        let mut valid_count = 0;
        
        for d in 0..8 {
            let dir:i8 = directions[d];
            let new_idx:i8 = current_idx as i8 + dir;
                
            if new_idx >= 0 & new_idx < 16 {
                let current_row:u32 = current_idx as u32 / 4;
                let current_col:u32 = current_idx as u32 % 4;
                let new_row:u32 = (new_idx as u32) / 4;
                let new_col:u32 = (new_idx as u32) % 4;
                
                let row_diff:u32 = abs_diff(current_row as u32, new_row as u32);
                let col_diff:u32 = abs_diff(current_col as u32, new_col as u32);
                
                if (row_diff <= 1) & (col_diff <= 1) & (solution[new_idx as u8] == 0) {
                    adjacent_cells[valid_count] = new_idx as u8;
                    valid_count += 1;
                }
            }
        }
        
        if valid_count == 0 {
            let mut empty_cells: [u8; 16] = [0; 16];
            let mut empty_count = 0;
            
            for i in 0..16 {
                if solution[i] == 0 {
                    empty_cells[empty_count] = i as u8;
                    empty_count += 1;
                }
            }
            
            if empty_count > 0 {
                let random_empty_idx = random_values[(current_num + 20) as u32] % empty_count as u16;
                current_idx = empty_cells[random_empty_idx];
            }
        } else {
            let random_adj_idx = random_values[current_num as u32] % valid_count as u16;
            current_idx = adjacent_cells[random_adj_idx];
        }
        
        current_num += 1;
        solution[current_idx] = current_num as u32;
    }
    
    let mut puzzle: [u32; 16] = [0; 16];
    
    for i in 0..16 {
        if (solution[i] == 1) | (solution[i] == 16) {
            puzzle[i] = solution[i];
        }
    }
    
    let mut clues_added = 0;
    for clue_idx in 30..50 {
        if clues_added < 2 {
            let random_value:u32 = (random_values[clue_idx] as u32 % 14) + 2; 
            
            for i in 0..16 {
                if (solution[i] == random_value) & (puzzle[i] == 0) & (clues_added < 2) {
                    puzzle[i] = solution[i];
                    clues_added += 1;
                }
            }
        }
    }
    
    puzzle
}

fn abs_diff(a: u32, b: u32) -> u32 {
    if (a as u32) > (b as u32) {
        a - b
    } else {
        b - a
    }
}

// Helper function to extract fixed positions from puzzle
fn extract_fixed_positions(puzzle: [u32; 16]) -> [Coordinate; 4] {
    let mut fixed_positions: [Coordinate; 4] = [
        Coordinate { row: 0, col: 0, value: 0 },
        Coordinate { row: 0, col: 0, value: 0 },
        Coordinate { row: 0, col: 0, value: 0 },
        Coordinate { row: 0, col: 0, value: 0 }
    ];
    
    let mut idx = 0;
    for i in 0..16 {
        if puzzle[i] != 0 {
            let row = (i / 4) as u32;
            let col = (i % 4) as u32;
            fixed_positions[idx] = Coordinate { row, col, value: puzzle[i] };
            idx += 1;
        }
    }
    
    fixed_positions
}

#[test]
fn test_puzzle_generation() {
    let randomness: Field = std::hash::poseidon2::Poseidon2::hash([1], 1);
    let grid_size: u32 = 4;
    
    let puzzle = main(0, randomness, grid_size, [0; 16], [
        Coordinate { row: 0, col: 0, value: 0 },
        Coordinate { row: 0, col: 0, value: 0 },
        Coordinate { row: 0, col: 0, value: 0 },
        Coordinate { row: 0, col: 0, value: 0 }
    ]);
    
    let mut clue_count = 0;
    for i in 0..16 {
        if puzzle[i] != 0 {
            clue_count += 1;
        }
    }
    assert(clue_count == 4, "Puzzle should have exactly 4 clues");
    
    let mut has_one = false;
    let mut has_sixteen = false;
    
    for i in 0..16 {
        if puzzle[i] == 1 {
            has_one = true;
        }
        if puzzle[i] == 16 {
            has_sixteen = true;
        }
    }
    
    assert(has_one, "Puzzle must include the number 1");
    assert(has_sixteen, "Puzzle must include the number 16");
    
    println("Puzzle generated successfully");
    println(puzzle);
}

#[test]
fn test_4x4_hidato_verification() {
    let solution = [
        1, 2, 3, 4,
        12, 13, 14, 5,
        11, 16, 15, 6,
        10, 9, 8, 7
    ];
    
    let fixed_positions = [
        Coordinate { row: 0, col: 0, value: 1 },    
        Coordinate { row: 0, col: 3, value: 4 },    
        Coordinate { row: 2, col: 1, value: 16 },  
        Coordinate { row: 3, col: 2, value: 8 }     
    ];
    
    let result = main(1, 0, 4, solution, fixed_positions);
    
    for i in 0..16 {
        assert(result[i] == solution[i], "Verification failed");
    }
}

#[test]
fn test_end_to_end() {
    let valid_solution = [
        1, 2, 3, 4,
        12, 13, 14, 5,
        11, 16, 15, 6,
        10, 9, 8, 7
    ];
    
    let mut puzzle = [0; 16];
    puzzle[0] = valid_solution[0];   
    puzzle[10] = valid_solution[10]; 
    puzzle[15] = valid_solution[15]; 
    puzzle[3] = valid_solution[3];  
    
    let fixed_positions = extract_fixed_positions(puzzle);
    
    let result = main(1, 0, 4, valid_solution, fixed_positions);
    
    for i in 0..16 {
        assert(result[i] == valid_solution[i], "End-to-end test failed");
    }
}