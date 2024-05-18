import { createPuzzle } from "./sudoku-generator.js";

const givens = new Map();
for (let i = 0; i < 10000; i++) {
    const p = createPuzzle({level: 81});
    const numGivens = [...p.puzzle].filter(c => c != '.').length;
    givens.set(numGivens, 1 + (givens.get(numGivens) || 0));
    if (i % 100 === 0) {
        const total = [...givens.values()].reduce((p, v) => p + v, 0);
        console.log(givens)
    }
}

console.log(givens);

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
/*



Map(9) {
  25 => 2968,
  26 => 1205,
  24 => 3410,
  23 => 1724,
  27 => 267,
  22 => 370,
  21 => 30,
  28 => 24,
  29 => 2
}
*/