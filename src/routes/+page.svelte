<script>
    import BoardComponent from './Board.svelte';
    import { createPuzzle } from '$lib/sudoku-generator.js';
    import Mousetrap from 'mousetrap';
    import Control from './Control.svelte';
    import Settings from './Settings.svelte';
    import Header from './Header.svelte';
    import { level, haptic, stopwatch, game, undo, mistakes, stats } from '$lib/settings.svelte.js';
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
        _solution = $state();
        _notes = $state([]);
        _error = $state(false);

        get digit () {
            return this._digit;
        }
        set digit (val) {
            this._digit = val;
        }

        get solution () {
            return this._solution;
        }
        set solution (val) {
            this._solution = val;
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

        constructor (id, symbol, solution) {
            this.id = id;
            this.digit = (symbol === '.') ? undefined : +symbol;
            this.frozen = (symbol !== '.');
            this.solution = solution;
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
        constructor ({ puzzle, solution }) {
            this.cells = {};
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    this.cells[i * 9 + j] = new Cell(i*9+j, puzzle[i * 9 + j], solution[i * 9 + j]);
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
                this.cells[i].error = false;

                if (this.cells[i].static || this.cells[i].digit === undefined) {
                    continue;
                }

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

    stopwatch.start();

    let board = $state(new Board(game));

    const fillCount = $derived.by(() => {
        const out = {};
        for (let i = 0; i < 81; i++) {
            if (board.cells[i].digit !== undefined) {
                out[board.cells[i].digit] = 1 + (out[board.cells[i].digit] || 0);
            }
        }
        return out;
    });

    let selected = $state(4*9 + 4);  // center cell selected
    let activeDigit = $derived(board.cells[selected].digit);
    let activeNotes = $derived.by(() => {
        if (board.cells[selected].digit) return [];
        return board.cells[selected].notes;
    });

    function handleCellSelected (id) {
        if (board.isError()) return;
        selected = id;
    }

    let boardComponent;

    let reveal = $state(false);

    undo.addEventListener('board:clear', x => {
        board.clear(x.index);
    });
    undo.addEventListener('board:fill', async x => {
        const { index, digit } = x;
        const oldDigit = board.cells[index].digit;
        board.fill(index, digit);
        if (!reveal) {
            if (board.cells[index].error) {
                // increment error count. Unless we do a noop
                if (digit !== oldDigit) {
                    mistakes.increment();
                    if (mistakes.count >= mistakes.limit) {
                        // game over!
                        const response = await modal.show(
                            'Game lost (too many mistakes)',
                            ['New game', 'Reveal solution'],
                        );

                        stats.lost();

                        if (response !== 'New game') {
                            reveal = true;
                        } else {
                            await reset();
                        }
                    }
                }
            } else if (board.isSolved() ) {
                stats.won();
                await reset();
            }
        }
    });
    undo.addEventListener('board:toggle-note', x => board.toggleNote(x.index, x.digit));

    function onUndo() {
        mistakes.withFreeze(() => undo.undo());
    }

    async function reset () {
        reveal = false;
        boardComponent && await boardComponent.hide();
        const { puzzle, solution } = createPuzzle({ level: level.value });
        game.set({ level: level.label, puzzle, solution });
        board = new Board(game);
        undo.clear();
        stopwatch.reset();
        mistakes.reset();
        boardComponent && await boardComponent.show();
        stopwatch.start();
    }

    Mousetrap.bind ('meta+z', onUndo);
    Mousetrap.bind ('ctrl+z', onUndo);

    function onFill (digit) {
        const index = $state.snapshot(selected);
        if (reveal || board.cells[index].frozen || fillCount[digit] >= 9) {
            console.log(board.isError())
            return;
        }
        const oldDigit = board.cells[index].digit;
        if (oldDigit === undefined) {
            undo.push({
                redo: ['board:fill', {index, digit}],
                undo: ['board:clear', {index}],
            });
        } else {
            undo.push({
                redo: ['board:fill', {index, digit}],
                undo: ['board:fill', {index, digit: oldDigit}],
            });
        }
    }

    function onToggleNote (digit) {
        if (reveal || board.isError()) {
            return;
        }
        const index = $state.snapshot(selected);
        undo.push({
            redo: ['board:toggle-note', {index, digit}],
            undo: ['board:toggle-note', {index, digit}],
        });
    }

    function onClear () {
        if (reveal || board.isError()) {
            return;
        }
        const index = $state.snapshot(selected);
        if (board.cells[index].frozen) {
            return;
        }
        const oldDigit = board.cells[index].digit;
        if (oldDigit === undefined) {
            return;
        }
        undo.push({
            redo: ['board:clear', {index}],
            undo: ['board:fill', {index, digit: oldDigit}],
        });
    }

    let inOnReset = 0;  // prevent recursion when user click fast
    async function onReset () {
        inOnReset += 1
        try {
            if (inOnReset !== 1) return;

            if ((mistakes.count > 0 || board.isTouched()) && !reveal) {
                const response = await modal.show(
                    'Abandon this game?',
                    ['OK', 'Cancel', 'Reveal solution'],
                )
                if (response === 'Cancel') {
                    return;
                }
                stats.lost();
                if (response == 'OK') {
                    await reset();
                } else {
                    reveal = true;
                }
            } else {
                await reset();
            }
        } finally {
            inOnReset -= 1;
        }
    }

    setTimeout(() => {
        mistakes.withFreeze(() => undo.replay());
    }, 0);

    let modal;
    let pause;
    let settings;

    function suspendTimer () {
        stopwatch.stop();
    }

    function resumeTimer () {
        if (!pause.isShowing() && !settings.isShowing()) {
            stopwatch.start();
        }
    }
</script>

<svelte:window onpageshow={resumeTimer} onfocus={resumeTimer} onpagehide={suspendTimer} onblur={suspendTimer} />

<div class="flex flex-col items-center justify-center mx-2 h-screen">
    <Pause bind:this={pause}/>
    <Modal bind:this={modal} />
    <Settings bind:this={settings} />
    <Header />
    <BoardComponent bind:this={boardComponent} {board} onselected={index => haptic(handleCellSelected(index))} {selected} {activeDigit} {reveal} />
    <Control {fillCount} {activeNotes} {onFill} {onClear} onPause={() => pause.show()} {onReset} {onUndo} {onToggleNote} onShowSettings={() => settings.show()} />
    <div class="grow"></div>
    <div class="text-center text-xs text-gray-500 mt-16 mb-8">
        <a href="https://github.com/pgmmpk/sudoku">
            <svg class="inline w-5 h-5 mr-2" width="98" height="96" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
            </svg>pgmmpk/sudoku
        </a>
    </div>
</div>