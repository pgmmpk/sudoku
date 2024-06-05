export const LEVELS = [
    { label: 'Beginner', value: 20, index: 0 },
    { label: 'Easy',     value: 35, index: 1 },
    { label: 'Hard',     value: 43, index: 2 },
    { label: 'Master',   value: 52, index: 3 },
    { label: 'Insane',   value: 64, index: 4 },
];

class Persistence {
    VERSION = '1'

    constructor (name) {
        this.name = name;
    }

    load (deflt) {
        const saved = localStorage.getItem(this.VERSION + '/' + this.name);
        if (saved === null) {
            return deflt;
        }
        return JSON.parse(saved);
    }

    save (val) {
        localStorage.setItem(this.VERSION + '/' + this.name, JSON.stringify(val, null, 2));
        return val;
    }
}

export const settings = (() => {
    const persistence = new Persistence('settings');
    let state = $state(persistence.load({
        vibrate: true,
    }));

    return {
        get vibrate () { return state.vibrate; },
        set vibrate (what) { state.vibrate = persistence.save(what); },
    };
})();

export function haptic () {
    settings.vibrate && navigator.vibrate && setTimeout(() => { navigator.vibrate(5); }, 0);
}

export const level = (() => {
    const persistence = new Persistence('level');
    let state = $state(persistence.load(0));

    return {
        get label () { return state.label; },
        get value () { return state.value; },
        get index () { return state.index; },
        set index (value) {
            state = LEVELS[persistence.save(value)];
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
    const persistence = new Persistence('undo');
    const savedTime = new Persistence('time');
    const out = new EventTarget();

    const stack = persistence.load([]);
    stopwatch.time = savedTime.load(0);

    function saveme() {
        persistence.save(stack);
        savedTime.save(stopwatch.time);
    }

    function undo () {
        if (stack.length > 0) {
            const cmd = stack.pop();
            dispatchEvent(...cmd.undo);
            saveme();
        }
    }

    function push (cmd) {
        stack.push(cmd);
        dispatchEvent(...cmd.redo);
        saveme();
    }

    function clear () {
        stack.length = 0;
        stopwatch.reset();
        saveme();
    }

    function replay () {
        for (const cmd of stack) {
            dispatchEvent(...cmd.redo);
        }
    }

    function addEventListener (type, handler) {
        const handle = e => handler(e.detail);
        out.addEventListener (type, handle);
        return () => out.removeEventListener(type, handle);
    }

    function dispatchEvent (type, detail) {
        out.dispatchEvent(new CustomEvent(type, { detail }));
    }

    return {
        undo,
        push,
        clear,
        replay,
        addEventListener,
        removeEventListener,
    };
})();

export const game = (() => {
    const persistence = new Persistence('game');
    let state = $state(persistence.load({
        level: LEVELS[0].label,
        puzzle: "..56....8413.28659.2.91534.2615749835978364.28342917..38216957415.48723674.352891",
        solution: "975643128413728659628915347261574983597836412834291765382169574159487236746352891",
    }));

    function set (options) {
        state = persistence.save(options);
    }

    return {
        set,
        get level () { return state.level; },
        get puzzle () { return state.puzzle; },
        get solution () { return state.solution; },
    };
})();

export const mistakes = (() => {
    const persistence = new Persistence('mistakes');
    let count = $state(persistence.load(0));
    const limit = 3;
    let freeze = false;
    const name = 'mistakes';

    function increment () {
        if (!freeze) {
            count = persistence.save(count + 1);
        }
    }

    function reset () {
        count = persistence.save(0);
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
            return Promise.all([promise]);
            /// promise.reject('another promise is pending');    
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
    const persistence = new Persistence('stats');
    let stats = $state(persistence.load({
        lostCount: 0,
        wonCount: 0,
    }));

    function lost() {
        stats.lostCount += 1;
        persistence.save(stats);
    }

    function won () {
        stats.wonCount += 1;
        persistence.save(stats);
    }

    function reset () {
        stats = persistence.save({
            lostCount: 0,
            wonCount: 0,
        });
    }

    return {
        get lostCount () { return stats.lostCount; },
        get wonCount () { return stats.wonCount; },

        lost,
        won,
        reset,
    };
})();
