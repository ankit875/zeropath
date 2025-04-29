// Hidato game verifier circuit in Noir
// This circuit verifies that a solution to a Hidato puzzle is valid

// Define a struct to hold coordinates
struct Coordinate {
    row: u32,
    col: u32,
    value: u32,
}

fn main(
    grid_size: pub u32,            // Size of the grid (assuming square grid)
    solution: pub [u32; 16],       // Flattened 1D array of the 4x4 solution
    fixed_positions: [Coordinate; 4], // Coordinates of fixed numbers in the original puzzle
) -> pub bool {
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
        
        // Cast Field to integers for comparison
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
        // Use & instead of &&
        let row_diff_int = row_diff as u32;
        let col_diff_int = col_diff as u32;
        assert((row_diff_int <= 1) & (col_diff_int <= 1), "Consecutive numbers must be adjacent");
        
        // Also ensure they're not the same position
        // Use | instead of ||
        let row_diff_int = row_diff as u32;
        let col_diff_int = col_diff as u32;
        let not_same_position = (row_diff_int > 0) | (col_diff_int > 0);
        assert(not_same_position, "Consecutive numbers cannot be at the same position");
    }
    
    // If all checks pass, return true
    true
}

// Helper function to calculate absolute difference
fn abs_diff(a: u32, b: u32) -> u32 {
    if (a as u32) > (b as u32) {
        a - b
    } else {
        b - a
    }
}

#[test]
fn test_4x4_hidato() {
    // Test case - 4x4 Hidato
    // 1  2  3  4
    // 12 13 14 5
    // 11 16 15 6
    // 10 9  8  7
    
    let solution = [
        1, 10, 11, 12,
        2, 9, 8, 13,
        3, 4, 7, 14,
        5, 6, 15, 16
       ];
    
    // let solution = [
    //     1, 2, 3, 4,
    //     12, 13, 14, 5,
    //     11, 16, 15, 6,
    //     10, 9, 8, 7
    // ];
    
    let fixed_positions = [
        Coordinate { row: 0, col: 0, value:1 }, // Position of 1
        Coordinate { row: 0, col: 3, value: 12 }, // Position of 12
        Coordinate { row: 2, col: 1, value: 4 }, // Position of 4
        Coordinate { row: 3, col: 3, value: 16 }  // Position of 16
    ];
    
   
    
    let result = main(4, solution, fixed_positions);
    assert(result);
}