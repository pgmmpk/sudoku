import { bus } from './bus.js';

export const LEVELS = [
    { label: 'Beginner', value: 1, index: 0 },
    { label: 'Easy',     value: 35, index: 1 },
    { label: 'Hard',     value: 40, index: 2 },
    { label: 'Master',   value: 52, index: 3 },
    { label: 'Insane',   value: 64, index: 4 },
];

export const settings = (() => {
    let state = $state({
        vibrate: true,
    });
    const name = 'settings';

    const saved = localStorage.getItem(name);
    if (saved !== null) {
        state = JSON.parse(saved);
    }

    function save () {
        localStorage.setItem(name, JSON.stringify(state, null, 2));
    }

    return {
        get vibrate () { return state.vibrate; },
        set vibrate (what) { state.vibrate = what; save(); },
    };
})();

export const level = (() => {
    let state = $state(LEVELS[0]);
    const name = 'level';

    const saved = localStorage.getItem(name);
    if (saved !== null) {
        state = LEVELS[JSON.parse(saved).index];
    }

    return {
        get label () { return state.label; },
        get value () { return state.value; },
        get index () { return state.index; },
        set index (value) {
            state = LEVELS[value];
            localStorage.setItem(name, JSON.stringify(state, null, 2));
        },
    };
})();


export const undo = (() => {
    const name = 'undo';
    const stack = [];
    const temp = [];

    const saved = localStorage.getItem(name);
    if (saved !== null) {
        temp.push(...JSON.parse(saved));
    }

    function save() {
        localStorage.setItem(name, JSON.stringify(stack, null, 2));
    }

    function undo () {
        if (stack.length > 0) {
            const cmd = stack.pop();
            bus.dispatchEvent(...cmd.undo);
            save();
        }
    }

    function push (cmd) {
        stack.push(cmd);
        bus.dispatchEvent(...cmd.redo);
        save();
    }

    function clear () {
        stack.length = 0;
        save();
    }

    function replay () {
        for (const cmd of temp) {
            bus.dispatchEvent(...cmd.redo);
        }
        temp.length = 0;
    }

    return {
        undo,
        push,
        clear,
        replay,
    };
})();

export const stopwatch = (() => {
    let seconds = $state(0);
    let minutes = $state(0);
    let hours = $state(0);

    let interval = null;

    function stop () {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    function start () {
        stop();
        interval = setInterval(() => { 
            seconds += 1; 
            if (seconds >= 60) {
                seconds = 0;
                minutes += 1;
                if (minutes >= 60) {
                    hours += 1;
                }
            }
        }, 1000);
    }

    function reset () {
        stop();
        hours = 0;
        minutes = 0;
        seconds = 0;
    }

    return {
        get seconds () { return seconds; },
        get minutes () { return minutes; },
        get hours () { return hours; },
        get ticking () { return interval !== null; },
        start,
        stop,
        reset,
    };
})();

export const game = (() => {
    const name = 'game';
    let level = $state(LEVELS[0].label);
    let puzzle = "..56....8413.28659.2.91534.2615749835978364.28342917..38216957415.48723674.352891";
    let solution = "975643128413728659628915347261574983597836412834291765382169574159487236746352891";
    const saved = localStorage.getItem(name);
    if (saved) {
        const obj = JSON.parse(saved);
        level = obj.level;
        puzzle = obj.puzzle;
        solution = obj.solution;
    }

    function set (options) {
        level = options.level;
        puzzle = options.puzzle;
        solution = options.solutions;
        localStorage.setItem(name, JSON.stringify({level, puzzle, solution}));
    }

    return {
        set,
        get level () { return level; },
        get puzzle () { return puzzle; },
        get solution () { return solution; },
    };
})();
