const ROWS = 'ABCDEFGHI'
const COLS = '123456789';
const DIGITS = COLS;

function cross(listA, listB) {
    return [...listA].map(a => [...listB].map(b => [a, b])).flat();
}

const SQUARES = cross(ROWS, COLS).map(([r,c]) => `${r}${c}`);

const [ UNITS, PEERS ] = (() => {
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
})();

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/*
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

function parseGrid(grid) {
    const values = new Map();

    for (const sid of SQUARES) {
        values.set(sid, [...DIGITS]);
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

function assign(values, s, d) {
    for (const d2 of values.get(s)) {
        if (d2 !== d) eliminate(values, s, d2);
    }
}

function eliminate(values, s, d) {
    if (!values.get(s).includes(d))
        return;

    values.set(s, values.get(s).filter(x => x !== d));

    if (!values.get(s).length) {
        throw new Error('backtrack');
    } 
    if (values.get(s).length === 1) {
        const d2 = values.get(s)[0];

        for (const s2 of PEERS[s]) {
            eliminate(values, s2, d2);
        }
    }

    for (let unit of UNITS[s]) {
        const dplaces = unit.filter(s2 => {
            return values.get(s2).includes(d);
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
    const unsolved = SQUARES.filter(s => values.get(s).length > 1);

    if (unsolved.length === 0) {
        yield values;
    } else {
        const s = unsolved.sort((s1, s2) => values.get(s1).length - values.get(s2).length)[0];

        for (const d of values.get(s)) {
            const dup = new Map(values);
            try {
                assign(dup, s, d);
                yield * searchAll(dup);
            } catch(err) {
                if (err.message !== 'backtrack') {
                    throw err;
                }
            }
        }
    }
}

function randomSolution() {
    const values = new Map();
    SQUARES.forEach(s => values.set(s, [...DIGITS]));

    for (let s of shuffle(SQUARES)) {
        try {
            assign(values, s, randomChoice(values.get(s)));
        } catch(err) {
            if (err.message !== 'backtrack') {
                throw err;
            }
            break;
        }

        let ds = SQUARES.filter(s => values.get(s).length === 1)
            .map(s => values.get(s));

        if (ds.length === 81) {
            return SQUARES.map(s => values.get(s)[0]).join('');
        }
    }

    return randomSolution();
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

/**
 * Generates sudoku puzzle and its solution.
 * 
 * Takes "level of difficulty" parameter, which is in integer in the range 1 - 64.
 * 
 * We define difficulty as the number of empty cells.
 * It is a well-known fact that the max theoretical sudoku difficulty is 81-17 = 64.
 * 
 * The "level" parameter is the max level that method will return. When asked to generate very tought
 * puzzles, it will often return less difficult ones. Here is the distribution of actual difficulties
 * when asked to generate an impossibly difficult puzzle:

    52 => 2
    53 => 24,
    54 => 267,
    55 => 1205,
    56 => 2968,
    57 => 3410,
    58 => 1724,
    59 => 370,
    60 => 30,

 * As you can see, it rarely generates 60, and most commonly produces 57. For difficulties 50 and less,
 * we will very likely generate just the one user asks for. 
 * 
 * Speed of this function is about 80ms per call. Clients may want to improve chances of generating tough
 * puzzles by calling this function in a loop, and checking the actual difficulty. For difficulties up to and
 * including 56, this may be a good idea, as such a loop will (on average) be executed just twice, resulting
 * in 160ms response. For higher difficulties, cost of ensuring exact difficulty will be higher.
 * 
 * We believe there is no point in trying to get this "difficulty" match exactly the requested "level",
 * because subjective Sudoku toughness is not determined solely by the number of hidden squares, but
 * depends on the techniques and methods required to solve it.
 */
export function createPuzzle({level = 81} = {}) {
    const solution = randomSolution();
    const shuffled = shuffle(SQUARES.map((_,i) => i));
    const puzzle = [...solution];

    for (const index of shuffled) {
        const saved = puzzle[index];
        puzzle[index] = '.';
        if (!hasUniqueSolution(puzzle)) {
            puzzle[index] = saved;
        } else {
            level -= 1;
            if (level <= 0) {
                break;
            }
        }
    }

    return {
        puzzle: puzzle.join(''),
        solution,
    };
}

export function solve (sudoku) {
    for (const solution of searchAll(parseGrid(sudoku))) {
        return SQUARES.map(sid => solution.get(sid)[0]).join('');
    }
}
