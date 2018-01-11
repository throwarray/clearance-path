//LIFO
export class ArrayStack {
    constructor (intSize) {
        if (!intSize) intSize = 1;
        this._size = 0;
        this._data = new Array(intSize);
        this._intSize = intSize;
        this._capacity = intSize;
    }
    push (val) {
        this._data[this._size] = val;
        this._size++;
        // Double size when full
        if (this._size === this._capacity) {
            this._capacity *= 2;
            this._resize();
        }
        return this._size;
    }
    clear () {
        this._size = 0;
        this._data = new Array(this._intSize);
        this._capacity = this._intSize;
    }
    pop () {
        if (!this._size) return;
        this._size--;
        let index = this._size;
        let item = this._data[index];
        this._data[index] = null;
        // Shrink to half size when one-quarter full
        if (this._size === this._capacity / 4) {
            this._capacity /= 2;
            this._resize();
        }
        return item;
    }
    peek () {
        return this._size ? this._data[this._size - 1] : void 0;
    }
    size () {
        return this._size;
    }
    entries () {
        return this[Symbol.iterator]();
    }
    forEach (fn, ctx = this) {
        let i = 0;
        for (let item of this) {
            fn.call(ctx, item, i, this);
            i++;
        }
        return;
    }
    *[Symbol.iterator] () {
        for (let i = this._size - 1; i >= 0; i--) {
            yield this._data[i];
        }
    }
    _resize () {
        const oldData = this._data;

        this._data = new Array(this._capacity);

        for (let i = 0; i < this._size; i++) {
            this._data[i] = oldData[i];
        }
    }
}

export class LinkedStack {
    constructor () {
        this._first = null;
        this._size = 0;
    }
    size () {
        return this._size;
    }
    push (item) {
        const old = this._first;
        this._first = { __proto__: null, item, next: old };
        this._size++;
        return this._size;
    }
    pop () {
        if (!this._size) return;
        const prev = this._first;
        const item = prev.item;
        this._first = prev.next;
        prev.next = null;
        this._size--;
        return item;
    }
    clear () {
        this._first = null;
        this._size = 0;
    }
    peek () {
        return this._first ? this._first.item : void 0;
    }
    entries () {
        return this[Symbol.iterator]();
    }
    forEach (fn, ctx = this) {
        let i = 0;
        for (let item of this) {
            fn.call(ctx, item, i, this);
            i++;
        }
        return;
    }
    *[Symbol.iterator] () {
        let f = this._first;
        while (f) {
            yield f.item;
            f = f.next;
        }
    }
}
