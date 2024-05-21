import { createPuzzle } from "../lib/sudoku-generator.js";

class Game {
    _level = $state(0);
    _board = $state('.................................................................................');
    _solution = $state('.................................................................................');
    _mistakes = $state(0);

    constructor ({ level, board, solution }) {
        this._level = level;
        this._board = board;
        this._solution = solution;
        this._mistakes = 0;
    }

    reset (level) {
        const { board, solution } = createPuzzle(level);
        this._level = level;
        this._board = board;
        this._solution = solution;
        this._mistakes = 0;
    }

    get level () {
        return this._level;
    }

    get board () {
        return this._board;
    }

    get solution () {
        return this._solution;
    }

    get mistakes () {
        return this._mistakes;
    }
}

export const level = new Level();