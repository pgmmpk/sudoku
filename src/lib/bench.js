import { createPuzzle } from "./sudoku-generator.js";

for (let i = 0; i < 100; i++) {
    createPuzzle({level: 81});
}

// const givens = [];
// for (let i = 0; i < 1000; i++) {
//     const p = createPuzzle({level: 55});
//     givens.push([...p.puzzle].filter(c => c != '.').length);
// }

// console.log(Math.min(...givens), Math.max(...givens))

/**
 * level: 81, actual givens 21-29 in 1000 tries (54-60 difficulty)
 *
 * level: 50, actual givens 31 in 1000 tries (50 difficulty)
 * 
 * level: 57, actual givens 24-28 in 1000 tries (53-57 difficulty)
 * 
 * level: 55, actual givens 24-28 in 1000 tries (53-55 difficulty)
 */