"use strict";

let defaultcomparator = function (a, b) {
    return a < b;
};

// the provided comparator function should take a, b and return *true* when a < b
function FastPriorityQueue(comparator) {
    if (!(this instanceof FastPriorityQueue)) return new FastPriorityQueue(comparator);
    this.array = [];
    this.size = 0;
    this.compare = comparator || defaultcomparator;
}


// Add an element the the queue
// runs in O(log n) time
FastPriorityQueue.prototype.add = function (myval) {
    let i = this.size;
    this.array[this.size] = myval;
    this.size += 1;
    let p;
    let ap;
    while (i > 0) {
        p = (i - 1) >> 1;
        ap = this.array[p];
        if (!this.compare(myval, ap)) {
            break;
        }
        this.array[i] = ap;
        i = p;
    }
    this.array[i] = myval;
};

// replace the content of the heap by provided array and "heapifies it"
FastPriorityQueue.prototype.heapify = function (arr) {
    this.array = arr;
    this.size = arr.length;
    let i;
    for (i = (this.size >> 1); i >= 0; i--) {
        this._percolateDown(i);
    }
};

// for internal use
FastPriorityQueue.prototype._percolateUp = function (i) {
    let myval = this.array[i];
    let p;
    let ap;
    while (i > 0) {
        p = (i - 1) >> 1;
        ap = this.array[p];
        if (!this.compare(myval, ap)) {
            break;
        }
        this.array[i] = ap;
        i = p;
    }
    this.array[i] = myval;
};


// for internal use
FastPriorityQueue.prototype._percolateDown = function (i) {
    let size = this.size;
    let hsize = this.size >>> 1;
    let ai = this.array[i];
    let l;
    let r;
    let bestc;
    while (i < hsize) {
        l = (i << 1) + 1;
        r = l + 1;
        bestc = this.array[l];
        if (r < size) {
            if (this.compare(this.array[r], bestc)) {
                l = r;
                bestc = this.array[r];
            }
        }
        if (!this.compare(bestc, ai)) {
            break;
        }
        this.array[i] = bestc;
        i = l;
    }
    this.array[i] = ai;
};

// Look at the top of the queue (a smallest element)
// executes in constant time
//
// Calling peek on an empty priority queue returns
// the "undefined" value.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
FastPriorityQueue.prototype.peek = function () {
    if(this.size == 0) return undefined;
    return this.array[0];
};

// remove the element on top of the heap (a smallest element)
// runs in logarithmic time
//
// If the priority queue is empty, the function returns the
// "undefined" value.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
// For long-running and large priority queues, or priority queues
// storing large objects, you may  want to call the trim function
// at strategic times to recover allocated memory.
FastPriorityQueue.prototype.poll = function () {
    if (this.size == 0)
        return undefined;
    let ans = this.array[0];
    if (this.size > 1) {
        this.array[0] = this.array[--this.size];
        this._percolateDown(0 | 0);
    } else {
        this.size -= 1;
    }
    return ans;
};


// This function adds the provided value to the heap, while removing
//  and returning the peek value (like poll). The size of the priority
// thus remains unchanged.
FastPriorityQueue.prototype.replaceTop = function (myval) {
    if (this.size == 0)
        return undefined;
    let ans = this.array[0];
    this.array[0] = myval;
    this._percolateDown(0 | 0);
    return ans;
};


// recover unused memory (for long-running priority queues)
FastPriorityQueue.prototype.trim = function () {
    this.array = this.array.slice(0, this.size);
};

// Check whether the heap is empty
FastPriorityQueue.prototype.isEmpty = function () {
    return this.size === 0;
};

// just for illustration purposes
let main = function () {
    // main code
    let x = new FastPriorityQueue(function (a, b) {
        return a < b;
    });
    x.add(1);
    x.add(0);
    x.add(5);
    x.add(4);
    x.add(3);
    while (!x.isEmpty()) {
        console.log(x.poll());
    }
};

if (require.main === module) {
    main();
}

module.exports = FastPriorityQueue;