/**
 * A JavaScript port based on "Solving Every Sudoku Puzzle"
 * by Peter Norvig.
 *
 * The article can be found here:
 * - http://norvig.com/sudoku.html
 *
 * The original Python source can be found here:
 * - https://github.com/norvig/pytudes/blob/master/sudoku.py
 */

import {
    getCols,
    getSquares,
    getUnitList,
    getUnits,
    getPeers,
    some,
    shuffle,
    all,
    getRandomInt
} from './sudoku-grid-util.js';

export const level = {
    easy: 28,
    medium: 37,
    hard: 45,
    master: 65,
    insane: 81,
};

const digits = getCols();
const squares = getSquares();
const unitlist = getUnitList();

const units = getUnits(squares, unitlist);
const peers = getPeers(squares, units);

/**
 * Convert grid to a dict of possible values, {square: digits},
 * or return false if a contradiction is detected.
 */
function parseGrid(grid) {
    let values = new Map();
    squares.forEach(s => values.set(s, digits));

    for (let [s, d] of gridValues(grid).entries()) {
        if (digits.has(d)) {
            assign(values, s, d);
        }
    }

    return values;
}

/**
 * Convert grid into a dict of {square: char} with '0' or '.' for empties.
 */
function gridValues(grid) {
    console.log(grid)
    let chars = [...grid].filter(c => digits.has(c) || c === '0' || c === '.');
    let values = new Map();
    let s = [...squares];

    for (let i = 0; i < s.length; i++) {
        values.set(s[i], chars[i]);
    }

    return values;
}

/**
 * Eliminate all the other values (except d) from values[s] and propagate.
 * Return values, except return False if a contradiction is detected.
 */
function assign(values, s, d) {
    const others = [...values.get(s)].filter(x => x !== d);

    for (const d2 of others) {
        eliminate(values, s, d2);
    }
}

/**
 * Eliminate d from values[s]; propagate when values or places <= 2.
 * Return values, except return False if a contradiction is detected.
 */
function eliminate(values, s, d) {
    if (!values.get(s).has(d))
        return;

    values.set(s, new Set([...values.get(s)].filter(x => x !== d)));

    if (!values.get(s).size) {
        throw new Error('backtrack');
    } 
    if (values.get(s).size === 1) {
        let d2 = [...values.get(s)][0];

        for (const s2 of peers.get(s)) {
            eliminate(values, s2, d2);
        }
    }

    for (let unit of units.get(s)) {
        let dplaces = [...unit].filter(s2 => values.get(s2).has(d));

        if (!dplaces.length) {
            throw new Error('backtrack');
        }
        
        if (dplaces.length === 1) {
            assign(values, dplaces[0], d);
        }
    }
}

function solve(grid) {
    return search(parseGrid(grid));
}

/**
 * Using depth-first search and propagation, try all possible values.
 */
function search(values) {
    if (all([...squares].map(s => values.get(s).size === 1)))
        return values;

    const s = [...squares]
        .filter(s => values.get(s).size > 1)
        .sort((s1, s2) => values.get(s1).size - values.get(s2).size)[0];

    for (const d of values.get(s)) {
        const dup = new Map(values);
        try {
            assign(dup, s, d);
            return search(dup);
        } catch(err) {

        }
    }

    throw new Error('backtrack');
}

function *searchAll(values) {
    if (all([...squares].map(s => values.get(s).size === 1))) {
        yield values;
    } else {
        const s = [...squares]
            .filter(s => values.get(s).size > 1)
            .sort((s1, s2) => values.get(s1).size - values.get(s2).size)[0];

        for (const d of values.get(s)) {
            const dup = new Map(values);
            try {
                assign(dup, s, d);
                yield * searchAll(dup);
            } catch(err) {
            }
        }
    }
}

function randomPuzzle() {
    let values = new Map();
    squares.forEach(s => values.set(s, digits));

    for (let s of shuffle(squares)) {
        try {
            assign(values, s, randomValue(values.get(s)));
        } catch(err) {
            break;
        }

        let ds = [...squares]
            .filter(s => values.get(s).size === 1)
            .map(s => values.get(s));

        if (ds.length === 81) {
            return [...squares]
                .map(s => [...values.get(s)][0]).join('');
        }
    }

    return randomPuzzle();
}

function randomValue(values) {
    return [...values][getRandomInt(0, values.size - 1)];
}

function hasUniqueSolution (sudoku) {
    let solution = null;

    for (const sol of searchAll(parseGrid(sudoku))) {
        if (solution === null) {
            solution = sol;
        } else {
            return false;
        }
    }
    return solution !== null;
}

export function createPuzzle(level = 81) {
    const solution = randomPuzzle();
    let shuffled = shuffle(squares);

    const puzzle = Object.fromEntries([...squares].map((sid,i) => [sid, solution[i]]));

    let difficulty = 0;
    for (const sid of shuffled) {
        const saved = puzzle[sid];
        puzzle[sid] = '.';
        const totry = [...squares].map(sid => puzzle[sid]).join('');
        if (!hasUniqueSolution(totry)) {
            puzzle[sid] = saved;
        } else {
            difficulty += 1;
            if (difficulty >= level) {
                break;
            }
        }
    }

    return {
        puzzle: [...squares].map(sid => puzzle[sid]).join(''),
        solution,
    };
}
