# ZeroPath: A Zero-Knowledge Hidato Puzzle Game

ZeroPath is a Hidato puzzle game that uses zero-knowledge proofs to verify solutions without revealing them. This project demonstrates how privacy-preserving technologies can be applied to gaming.

## What is Hidato?

Hidato is a logic puzzle game where you need to fill a grid with consecutive numbers that connect horizontally, vertically, or diagonally. Some numbers are given as clues, and you need to fill in the rest to create a valid path from the smallest to the largest number.

## Project Overview

This project combines:
- A playable Hidato puzzle game built with Next.js and TypeScript
- Zero-knowledge proof verification using Noir (a domain-specific language for ZK proofs)
- Client-side proof generation for a seamless user experience

## Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn package manager
- Noir toolchain (for ZK proof integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ankit875/zeropath.git
cd zeropath
```

2. Install dependencies:
```bash
yarn install
```

3. Run the development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the game.

## How to Play

1. You'll see a 4x4 grid with some numbers filled in (the clues)
2. Fill in the empty squares with numbers from 1 to 16
3. Numbers must form a continuous path where consecutive numbers are adjacent (horizontally, vertically, or diagonally)
4. Click "Verify Solution" to check if your solution is correct

## Zero-Knowledge Integration

This project uses Noir for zero-knowledge proof generation and verification. The basic workflow is:

1. User solves the Hidato puzzle
2. When they click "Verify", the app generates a ZK proof that:
   - Proves they have a valid solution
   - Without revealing what that solution is
3. The proof can be verified by anyone, confirming the user has a valid solution

## Project Structure

```
zeropath/
├── app/                  # Next.js app directory
├── components/           # React components
│   └── hidato/           # Game-specific components
├── context/              # React context for state management
├── utils/                # Utility functions
├── circuit/              # Noir circuit for ZK proofs
```

## Future Enhancements

- Multiple puzzle difficulties
- Competitive mode with time tracking
- On-chain verification
- Leaderboard

## License

[MIT](LICENSE)