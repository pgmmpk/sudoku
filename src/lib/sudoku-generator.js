export const level = {
    easy: 28,
    medium: 35,
    hard: 40,
    master: 52,
    insane: 81,
};

const ROWS = 'ABCDEFGHI'
const COLS = '123456789';
const DIGITS = COLS;

function cross(listA, listB) {
    return [...listA].map(a => [...listB].map(b => [a, b])).flat();
}

const SQUARES = cross(ROWS, COLS).map(([r,c]) => `${r}${c}`);

function computeUnitsAndPeers() {
    const units = {};
    const peers = {};

    const boxes = cross(['ABC', 'DEF', 'GHI'], ['123', '456', '789']).map(
        ([rows, cols]) => cross(rows, cols).map(([r,c]) => `${r}${c}`)
    );

    for (const sid of SQUARES) {
        const [r, c] = sid;
        const sameRow = [...COLS].map(x => `${r}${x}`);
        const sameCol = [...ROWS].map(x => `${x}${c}`);
        const sameBox = boxes.filter(box => box.includes(sid))[0];

        units[sid] = [
            sameRow,
            sameCol,
            sameBox,
        ];

        const unique = new Set([...sameRow, ...sameCol, ...sameBox]);
        unique.delete(sid);

        peers[sid] = [...unique];
    }

    return [units, peers];
}

const [ UNITS, PEERS ] = computeUnitsAndPeers();

/**
 * Convert grid to a dict of possible values, {square: DIGITS},
 * or return false if a contradiction is detected.
 */
function parseGrid(grid) {
    const values = {};

    for (const sid of SQUARES) {
        values[sid] = [...DIGITS];
    }

    for (let i = 0; i < 81; i++) {
        const s = SQUARES[i];
        const d = grid[i];
        if (DIGITS.includes(d)) {
            assign(values, s, d);
        }
    }

    return values;
}

/**
 * Eliminate all the other values (except d) from values[s] and propagate.
 * Return values, except return False if a contradiction is detected.
 */
function assign(values, s, d) {
    const others = values[s].filter(x => x !== d);
    for (const d2 of others) {
        eliminate(values, s, d2);
    }
}

/**
 * Eliminate d from values[s]; propagate when values or places <= 2.
 * Return values, except return False if a contradiction is detected.
 */
function eliminate(values, s, d) {
    if (!values[s].includes(d))
        return;

    values[s] = values[s].filter(x => x !== d);

    if (!values[s].length) {
        throw new Error('backtrack');
    } 
    if (values[s].length === 1) {
        const d2 = values[s][0];

        for (const s2 of PEERS[s]) {
            eliminate(values, s2, d2);
        }
    }

    for (let unit of UNITS[s]) {
        let dplaces = unit.filter(s2 => {
            return values[s2].includes(d);
        });

        if (!dplaces.length) {
            throw new Error('backtrack');
        }
        
        if (dplaces.length === 1) {
            assign(values, dplaces[0], d);
        }
    }
}

function * searchAll(values) {
    const unsolved = SQUARES.filter(s => values[s].length > 1);

    if (unsolved.length === 0) {
        yield values;
    } else {
        const s = unsolved.sort((s1, s2) => values[s1].length - values[s2].length)[0];

        for (const d of values[s]) {
            const dup = { ...values };
            try {
                assign(dup, s, d);
                yield * searchAll(dup);
            } catch(err) {
            }
        }
    }
}

/**
 * Durstenfeld shuffle
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffle (seq) {
    const array = [...seq];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function randomSolution() {
    const values = {};
    SQUARES.forEach(s => values[s] = [...DIGITS]);

    for (let s of shuffle(SQUARES)) {
        try {
            assign(values, s, randomChoice(values[s]));
        } catch(err) {
            break;
        }

        const ds = SQUARES.filter(s => values[s].length === 1).map(s => values[s]);
        if (ds.length === 81) {
            return SQUARES.map(s => values[s][0]).join('');
        }
    }

    return randomSolution();
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
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

export function createPuzzle({level = 81} = {}) {
    const solution = randomSolution();
    let shuffled = shuffle(SQUARES);

    const puzzle = Object.fromEntries(SQUARES.map((sid,i) => [sid, solution[i]]));

    for (const sid of shuffled) {
        const saved = puzzle[sid];
        puzzle[sid] = '.';
        const totry = SQUARES.map(sid => puzzle[sid]).join('');
        if (!hasUniqueSolution(totry)) {
            puzzle[sid] = saved;
        } else {
            level -= 1;
            if (level <= 0) {
                break;
            }
        }
    }

    return {
        puzzle: SQUARES.map(sid => puzzle[sid]).join(''),
        solution,
    };
}
