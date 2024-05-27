import { bus } from './bus.js';

function save (name, object) {
    localStorage.setItem(name, JSON.stringify(object, null, 2));
}

function load (name) {
    const saved = localStorage.getItem(name);
    if (saved === null) {
        return undefined;
    }
    return JSON.parse(saved);
}

export const LEVELS = [
    { label: 'Beginner', value: 20, index: 0 },
    { label: 'Easy',     value: 35, index: 1 },
    { label: 'Hard',     value: 43, index: 2 },
    { label: 'Master',   value: 52, index: 3 },
    { label: 'Insane',   value: 64, index: 4 },
];

export const settings = (() => {
    let state = $state({
        vibrate: true,
    });
    const name = 'settings';

    const saved = load(name);
    if (saved !== undefined) {
        state = saved;
    }

    return {
        get vibrate () { return state.vibrate; },
        set vibrate (what) { state.vibrate = what; save(name, state); },
    };
})();

export function haptic () {
    if (settings.vibrate) {
       navigator.vibrate &&  navigator.vibrate(5);
    }
}

export const level = (() => {
    let state = $state(LEVELS[0]);
    const name = 'level';

    const saved = load(name);
    if (saved !== undefined) {
        state = LEVELS[saved.index];
    }

    return {
        get label () { return state.label; },
        get value () { return state.value; },
        get index () { return state.index; },
        set index (value) {
            state = LEVELS[value];
            save(name, state);
        },
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
        get time () {
            return seconds + minutes * 60 + hours * 60 * 60;
        },
        set time (value) {
            seconds = Math.floor(value) % 60;
            minutes = Math.floor(value / 60) % 60;
            hours = Math.floor(value / 60 / 60);
        },
        start,
        stop,
        reset,
    };
})();

export const undo = (() => {
    const name = 'undo';
    const stack = [];

    const saved = load(name);
    if (saved !== undefined) {
        stack.push(...saved);
    }

    const savedTime = load('time');
    if (savedTime) {
        stopwatch.time = savedTime;
    }

    function saveme() {
        save(name, stack);
        save('time', stopwatch.time);
    }

    function undo () {
        if (stack.length > 0) {
            const cmd = stack.pop();
            bus.dispatchEvent(...cmd.undo);
            saveme();
        }
    }

    function push (cmd) {
        stack.push(cmd);
        bus.dispatchEvent(...cmd.redo);
        saveme();
    }

    function clear () {
        stack.length = 0;
        stopwatch.reset();
        saveme();
    }

    function replay () {
        for (const cmd of stack) {
            bus.dispatchEvent(...cmd.redo);
        }
    }

    return {
        undo,
        push,
        clear,
        replay,
    };
})();

export const game = (() => {
    const name = 'game';
    let level = $state(LEVELS[0].label);
    let puzzle = "..56....8413.28659.2.91534.2615749835978364.28342917..38216957415.48723674.352891";
    let solution = "975643128413728659628915347261574983597836412834291765382169574159487236746352891";
    const saved = localStorage.getItem(name);
    if (saved) {
        ({ level, puzzle, solution } = JSON.parse(saved));
        if (solution === undefined) {  // avoid crash on upgrade
            level = $state(LEVELS[0].label);
            puzzle = "..56....8413.28659.2.91534.2615749835978364.28342917..38216957415.48723674.352891";
            solution = "975643128413728659628915347261574983597836412834291765382169574159487236746352891";
        }
    }

    function set (options) {
        ( {level, puzzle, solution } = options );
        localStorage.setItem(name, JSON.stringify({ level, puzzle, solution }));
    }

    return {
        set,
        get level () { return level; },
        get puzzle () { return puzzle; },
        get solution () { return solution; },
    };
})();

export const modal = (() => {
    let show = $state(false);
    let type = $state('info');
    let mess = $state('');

    let done;

    function complete () {
        show = false;
        done && done();
    }

    function info (message, onok) {
        type = 'info';
        mess = message;
        show = true;
        done = onok;
    };

    return {
        info,
        get show () { return show; },
        get type () { return type; },
        get message () { return mess; },
        complete,
    }
})();

export const mistakes = (() => {
    let count = $state(0);
    const limit = 3;
    let freeze = false;
    const name = 'mistakes';

    const saved = load(name);
    if (saved !== undefined) {
        count = saved;
    }

    function increment () {
        if (!freeze) {
            count += 1;
            save(name, count);
        }
    }

    function reset () {
        count = 0;
        save(name, count);
    }

    function withFreeze (f) {
        freeze = true;
        try {
            f();
        } finally {
            freeze = false;
        }
    }

    return {
        get count () { return count; },
        get limit () { return limit; },
        increment,
        reset,
        withFreeze,
    };
})();


export function createPromiser () {
    let promise;

    function wait () {
        if (promise) {
            promise.reject('another promise is pending');    
        }
        promise = Promise.withResolvers();
        return promise.promise;
    }

    function resolve (...av) {
        promise && promise.resolve(...av);
        promise = undefined;
    }

    function reject (...av) {
        promise && promise.reject(...av);
        promise = undefined;
    }

    return {
        wait,
        resolve,
        reject,
    };
}

export const stats = (() => {
    const name = 'stats';
    let lostCount = $state(0);
    let wonCount = $state(0);

    const saved = load(name);
    if (saved !== undefined) {
        ({ lostCount, wonCount } = saved);
    }

    function lost() {
        lostCount += 1;
        save(name, {lostCount, wonCount});
    }

    function won () {
        wonCount += 1;
        save(name, {lostCount, wonCount});
    }

    function reset () {
        wonCount = 0;
        lostCount = 0;
        save(name, {lostCount, wonCount});
    }

    return {
        get lostCount () { return lostCount; },
        get wonCount () { return wonCount; },

        lost,
        won,
        reset,
    };
})();

export const filled = (() => {
    const value = $state({});

    function reset(puzzle) {
        for (const digit of '123456789') {
            value[digit] = 0;
        }
        for (const digit of puzzle) {
            if (digit === '.') continue;
            value[digit] += 1;
        }
    }

    return {
        get value () { return value; },
        reset,
    };
})();