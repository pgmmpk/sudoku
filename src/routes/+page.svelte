<script>
    import BoardComponent from './Board.svelte';
    import { createPuzzle, LEVEL } from '$lib/sudoku-generator.js';
    import Mousetrap from 'mousetrap';
    import Control from './Control.svelte';
    import Settings from './Settings.svelte';

    function row (index) {
        return Math.floor(index / 9);
    }

    function col (index) {
        return index % 9;
    }

    function box (index) {
        const boxRow = Math.floor(row(index) / 3);
        const boxCol = Math.floor(col(index) / 3);

        return boxRow * 3 + boxCol;
    }

    function isPeer (i, j) {
        if (i === j) return false;
        if (row(i) === row(j)) return true;
        if (col(i) === col(j)) return true;
        if (box(i) === box(j)) return true;
        return false;
    }

    class Cell {
        _digit = $state();
        _notes = $state([]);
        _error = $state(false);

        get digit () {
            return this._digit;
        }
        set digit (val) {
            this._digit = val;
        }

        get notes() {
            return this._notes;
        }
        set notes (val) {
            this._notes = val;
        }

        get error() {
            return this._error;
        }
        set error (val) {
            this._error = val;
        }
        
        constructor (id, symbol) {
            this.id = id;
            this.digit = (symbol === '.') ? undefined : +symbol;
            this.frozen = (symbol !== '.');
            this.error = false;
        }

        toggleNote (digit) {
            const index = this.notes.indexOf(digit);
            if (index >= 0) {
                this.notes.splice(index, 1);
            } else {
                this.notes.push(digit);
            }
        }
    }

    class Board {
        constructor (boardString) {
            console.log({boardString})
            this.cells = {};
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    this.cells[i * 9 + j] = new Cell(i*9+j, boardString[i * 9 + j]);
                }
            }

            this.peers = {};
            for (let i = 0; i < 81; i++) {
                this.peers[i] = [];
                for (let j = 0; j < 81; j++) {
                    if (isPeer(i, j)) {
                        this.peers[i].push(j);
                    }
                }
            }
        }

        fill (index, value) {
            if (this.cells[index].static) {
                return;  // can not change statically assigned digit
            }
            this.cells[index].digit = value;
            this.locateConflicts();
        }

        clear (index) {
            if (this.cells[index].static) {
                return;  // can not clear statically assigned digit
            }
            this.cells[index].digit = undefined;
            this.locateConflicts();
        }

        toggleNote (index, digit) {
            if (this.cells[index].digit !== undefined) {
                return;
            }
            this.cells[index].toggleNote(digit);
        }

        locateConflicts () {
            for (let i = 0; i < 81; i++) {
                if (this.cells[i].static || this.cells[i].digit === undefined) {
                    continue;
                }

                let conflict = false;
                for (const peer of this.peers[i]) {
                    if (this.cells[peer].digit == this.cells[i].digit) {
                        conflict = true;
                    }
                }

                this.cells[i].error = conflict;
            }
        }

        isSolved () {
            for (let i = 0; i < 81; i++) {
                if (this.cells[i].digit === undefined) {
                    return false;
                }
            }

            return true;
        }
    }

    // const game = '.8291763.1..8.6....6....58...54.9.7.9.4.6.12......5..6.7638.....9..7436.3586.24.7';
    //const game = '68.7....2..9...8..3...9.............7..91.48.....38.75..13.56...5..6.3.......7..9'
    let level = $state(64);
    
    function oncommand(cmd) {
        const { command } = cmd;

        if (command === 'reset') {
            board = new Board(createPuzzle({level}).puzzle);
            undoStack.length = 0;
        } else if (command === 'fill') {
            push(fill(+cmd.digit));
        } else if (command === 'toggle-note') {
            push(toggleNote(+cmd.digit));
        } else if (command === 'undo') {
            undo();
        } else if (command === 'settings') {
            active = true;
        }
    }

    let board = $state(new Board(createPuzzle({level})));

    let selected = $state(4*9 + 4);  // center cell selected
    let activeDigit = $derived(board.cells[selected].digit);

    function handleCellClick (id) {
        selected = id;
    }

    function noop() {}

    function fill (value) {
        const index = selected;
        if (board.cells[selected].frozen) {
            return {
                redo: noop,
                undo: noop,
            };
        }
        const oldDigit = board.cells[index].digit;
        if (oldDigit === undefined) {
            return {
                redo: () => board.fill(index, value),
                undo: () => board.clear(index),
            };
        } else {
            return {
                redo: () => board.fill(index, value),
                undo: () => board.fill(index, oldDigit),
            };
        }
    }

    function clear () {
        const index = selected;
        if (board.cells[selected].frozen) {
            return {
                redo: noop,
                undo: noop,
            };
        }
        const oldDigit = board.cells[index].digit;
        if (oldDigit === undefined) {
            return {
                redo: noop,
                undo: noop,
            };
        } else {
            return {
                redo: () => board.clear(index),
                undo: () => board.fill(index, oldDigit),
            };
        }
    }

    function toggleNote (digit) {
        const index = selected;
        if (board.cells[selected].frozen || board.cells[index].digit !== undefined) {
            return {
                redo: noop,
                undo: noop,
            };
        }
        return {
            redo: () => board.toggleNote(index, digit),
            undo: () => board.toggleNote(index, digit),
        };
    }

    const undoStack = [];
    function undo() {
        if (undoStack.length > 0) {
            undoStack.pop().undo();
        }
    }

    function push(action) {
        undoStack.push(action);
        action.redo();
    }

    Mousetrap.bind ('meta+z', undo);

    Mousetrap.bind ('1', () => push(fill(1)));
    Mousetrap.bind ('2', () => push(fill(2)));
    Mousetrap.bind ('3', () => push(fill(3)));
    Mousetrap.bind ('4', () => push(fill(4)));
    Mousetrap.bind ('5', () => push(fill(5)));
    Mousetrap.bind ('6', () => push(fill(6)));
    Mousetrap.bind ('7', () => push(fill(7)));
    Mousetrap.bind ('8', () => push(fill(8)));
    Mousetrap.bind ('9', () => push(fill(9)));
    Mousetrap.bind ('0', () => push(clear()));
    Mousetrap.bind ('del', () => push(clear()));

    Mousetrap.bind ('ctrl+1', () => push(toggleNote(1)));
    Mousetrap.bind ('ctrl+2', () => push(toggleNote(2)));
    Mousetrap.bind ('ctrl+3', () => push(toggleNote(3)));
    Mousetrap.bind ('ctrl+4', () => push(toggleNote(4)));
    Mousetrap.bind ('ctrl+5', () => push(toggleNote(5)));
    Mousetrap.bind ('ctrl+6', () => push(toggleNote(6)));
    Mousetrap.bind ('ctrl+7', () => push(toggleNote(7)));
    Mousetrap.bind ('ctrl+8', () => push(toggleNote(8)));
    Mousetrap.bind ('ctrl+9', () => push(toggleNote(9)));

    let active = $state(false);

    $inspect({active})
</script>

<div class="flex flex-col items-center justify-center">
    <Settings bind:level={level} bind:active={active} />
    <BoardComponent {board} onclick={handleCellClick} {selected} {activeDigit} />
    <Control {oncommand} />
</div>