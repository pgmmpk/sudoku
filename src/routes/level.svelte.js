export const LEVELS = [
    { label: 'Beginner', value: 1, index: 0 },
    { label: 'Easy',     value: 35, index: 1 },
    { label: 'Hard',     value: 40, index: 2 },
    { label: 'Master',   value: 52, index: 3 },
    { label: 'Insane',   value: 64, index: 4 },
];

class Level {
    _index = $state.frozen(0);

    get index () {
        return this._index;
    }

    set index (value) {
        this._index = value;
    }

    get label () {
        return LEVELS[this._index].label;
    }

    get value () {
        return LEVELS[this._index].value;
    }
}

export const level = new Level();