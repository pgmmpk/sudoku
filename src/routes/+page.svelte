<script>
    import BoardComponent from './Board.svelte';
    import { createPuzzle } from '$lib/sudoku-generator.js';
    import Mousetrap from 'mousetrap';
    import Control from './Control.svelte';
    import Settings from './Settings.svelte';
    import Header from './Header.svelte';
    import { level, haptic, stopwatch, game, undo as undoStack, mistakes, stats , filled } from '$lib/settings.svelte.js';
    import { bus } from '$lib/bus.js';
    import Pause from './Pause.svelte';
    import Modal from './Modal.svelte';

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

                this.cells[i].error = false;
                for (const peer of this.peers[i]) {
                    if (this.cells[peer].digit == this.cells[i].digit) {
                        this.cells[i].error = true;
                        break;
                    }
                }
            }
        }

        isSolved () {
            for (let i = 0; i < 81; i++) {
                if (this.cells[i].digit === undefined || this.cells[i].error) {
                    return false;
                }
            }

            return true;
        }

        isError () {
            for (let i = 0; i < 81; i++) {
                if (this.cells[i].error) {
                    return true;
                }
            }

            return false;
        }

        isTouched () {
            for (let i = 0; i < 81; i++) {
                if (this.cells[i].notes.length > 0 || (this.cells[i].digit !== undefined && !this.cells[i].frozen)) {
                    return true;
                }
            }

            return false;
        }
    }

    // const game = '.8291763.1..8.6....6....58...54.9.7.9.4.6.12......5..6.7638.....9..7436.3586.24.7';
    //const game = '68.7....2..9...8..3...9.............7..91.48.....38.75..13.56...5..6.3.......7..9'
    stopwatch.start();

    let board = $state(new Board(game.puzzle));

    filled.reset(game.puzzle);

    let selected = $state(4*9 + 4);  // center cell selected
    let activeDigit = $derived(board.cells[selected].digit);

    function handleCellClick (id) {
        selected = id;
    }

    let boardComponent;

    bus.addEventListener('board:clear', x => {
        const oldDigit = board.cells[x.index].digit;
        board.clear(x.index);

        // track numbe rof filled digits
        if (oldDigit !== undefined) {
            filled.value[oldDigit] -= 1;
        }
    });
    bus.addEventListener('board:fill', async x => {
        const { index, digit } = x;
        const oldDigit = board.cells[index].digit;
        board.fill(index, digit);
        if (board.cells[index].error) {
            // increment error count. Unless we do a noop
            if (digit !== oldDigit) {
                mistakes.increment();
                if (mistakes.count >= mistakes.limit) {
                    // game over!
                    await boardComponent.hide({fail: true});
                    stats.lost();
                    setTimeout(reset, 0);
                }
            }
        } else if (board.isSolved() ) {
            await boardComponent.hide();
            stats.won();
            setTimeout(reset, 0);
        }

        // track number of filled digits
        if (oldDigit === undefined) {
            filled.value[digit] += 1;
        } else if (oldDigit !== digit) {
            filled.value[oldDigit] -= 1;
            filled.vaLUE[digit] += 1;
        }
    });
    bus.addEventListener('board:toggle-note', x => board.toggleNote(x.index, x.digit));

    function undo() {
        mistakes.withFreeze(() => undoStack.undo());
    }

    function reset () {
        const levelLabel = level.label;
        const { puzzle, solution } = createPuzzle({level: level.value});
        game.set({level: levelLabel, puzzle, solution});
        board = new Board(puzzle);
        undoStack.clear();
        stopwatch.reset();
        stopwatch.start();
        mistakes.reset();
        boardComponent.show();
        filled.reset(game.puzzle);
    }

    Mousetrap.bind ('meta+z', undo);

    bus.addEventListener('fill', digit => {
        const index = $state.snapshot(selected);
        if (board.cells[index].frozen || filled.value[digit] >= 9) {
            return;
        }
        const oldDigit = board.cells[index].digit;
        if (oldDigit === undefined) {
            undoStack.push({
                redo: ['board:fill', {index, digit}],
                undo: ['board:clear', {index}],
            });
        } else {
            undoStack.push({
                redo: ['board:fill', {index, digit}],
                undo: ['board:fill', {index, digit: oldDigit}],
            });
        }
    });
    bus.addEventListener('toggle-note', digit => {
        const index = $state.snapshot(selected);
        console.log('toggle', {index, digit})
        undoStack.push({
            redo: ['board:toggle-note', {index, digit}],
            undo: ['board:toggle-note', {index, digit}],
        });
    });
    bus.addEventListener('clear', () => {
        const index = $state.snapshot(selected);
        if (board.cells[index].frozen) {
            return;
        }
        const oldDigit = board.cells[index].digit;
        if (oldDigit === undefined) {
            return;
        }
        undoStack.push({
            redo: ['board:clear', {index}],
            undo: ['board:fill', {index, digit: oldDigit}],
        });
    });
    bus.addEventListener('reset', async () => {
        if (board.isTouched()) {
            if (!await modal.confirm('Abandoning game?')) {
                return;
            }
            await boardComponent.hide({fail: true});
            stats.lost();
        }
        reset();
    });
    bus.addEventListener('undo', undo);

    mistakes.withFreeze(() => undoStack.replay());

    let modal;
</script>

<div class="flex flex-col items-center justify-center m-2">
    <Pause />
    <Modal bind:this={modal} />
    <Settings />
    <Header />
    <BoardComponent bind:this={boardComponent} {board} onclick={index => haptic(handleCellClick(index))} {selected} {activeDigit} />
    <Control {bus} />
    <div class="grow"></div>
    <div class="text-center text-xs text-gray-500 mt-16 mb-2">
        <a href="https://github.com/pgmmpk/sudoku">
            <svg class="inline w-5 h-5 mr-2" width="98" height="96" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
            </svg>pgmmpk/talkback
        </a>
    </div>
</div>