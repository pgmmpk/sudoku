import { createPuzzle } from "../lib/sudoku-generator.js";
import { level } from './level.svelte.js';

class Game {
    _level = $state(0);
    _board = $state('.................................................................................');
    _solution = $state('.................................................................................');
    _mistakes = $state(0);

    constructor ({ board, solution }) {
        this._level = level.value;
        this._board = board;
        this._solution = solution;
        this._mistakes = 0;
    }

    reset () {
        const { board, solution } = createPuzzle(level.value);
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

export const game = new Game();