export class Bus {
    constructor () {
        this._bus = new EventTarget();
    }

    addEventListener (type, handler) {
        const handle = e => handler(e.detail);
        this._bus.addEventListener (type, handle);
        return () => this._bus.removeEventListener(type, handle);
    }

    dispatchEvent (type, detail) {
        this._bus.dispatchEvent(new CustomEvent(type, { detail }));
    }
}

export const bus = new Bus();
