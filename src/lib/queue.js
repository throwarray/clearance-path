//FIFO
export class LinkedQueue {
    constructor () {
        this._size = 0;
        this._first = null;
        this._last = null;
    }
    size () { return this._size; }
    peek () { return this._first ? this._first.item : void 0; }
    enqueue (item) {
        const prev = this._last;
        this._last = { __proto__: null, next: null, item };
        if (this._first === null) this._first = this._last;
        else prev.next = this._last;
        this._size++;
        return this._size;
    }
    dequeue () {
        if (!this._first) return;
        const prev = this._first;
        const item = prev.item;
        this._first = prev.next;
        prev.next = null;
        if (this._first === null) this._last = null;
        this._size--;
        return item;
    }
    entries () {
        return this[Symbol.iterator]();
    }
    forEach (fn, ctx) {
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


export class ArrayQueue {
    constructor (intCapacity) {
        const capacity = intCapacity || 1;
        this._size = 0;
        this._head = 0;
        this._tail = 0;
        this._capacity = capacity;
        this._data = new Array(capacity);
    }
    size () { return this._size; }
    peek () { return this._size ? this._data[this._head] : void 0; }
    _resize (k = 0) {
        const oldData = this._data;

        this._data = new Array(this._capacity);
        this._head = 0;
        this._tail -= k;

        for (let i = 0; i < this._size; i++) {
            this._data[i] = oldData[k + i];
        }
    }
    enqueue (item) {
        this._data[this._tail] = item;
        this._size++;
        this._tail++;
        if (this._tail === this._capacity || this._size === this._capacity) {
            this.capacity *= 2;
            this._resize(this._head);
        }
        return this._size;
    }
    dequeue () {
        if (!this._size) return;
        const item = this._data[this._head];
        this._data[this._head] = null;
        this._head++;
        this._size--;
        if (this._size === this._capacity / 4) {
            this.capacity /= 2;
            this._resize(this._head);
        }
        return item;
    }
    entries () {
        return this[Symbol.iterator]();
    }
    forEach (fn, ctx) {
        let i = 0;
        for (let item of this) {
            fn.call(ctx, item, i, this);
            i++;
        }
        return;
    }
    *[Symbol.iterator] () {
        for (let i = this._head; i < this._size; i++) {
            yield this._data[i];
        }
    }
}


// export class RandomQueue extends ArrayQueue {
//     constructor (intCapacity) {
//         super(intCapacity);
//     }
//     // Breaks order?
//     dequeue () {
//         let data = this._data;
//         let i = this._head + Math.floor(Math.random() * this._size);
//         let t = data[i];
//         data[i] = data[this._head];
//         data[this._head] = t;
//         return super.dequeue();
//     }
// }
