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

const INPUT_FILE="./dataset.csv";
const OUTPUT_FILE="./combos.csv";

const MAX_COMBINACIONES = 40000;
const COST_LIMIT = 30000;
const LINE_IN_BYTES = (36 + 1 + 36 + 1);
//const COMMA = ",".getBytes(StandardCharsets.US_ASCII)[0];
//const NEWLINE = "\n".getBytes(StandardCharsets.US_ASCII)[0];

function orderDesc(a,b) {
	return a.cost > b.cost;
}

function orderAsc(a,b) {
	return b.cost > a.cost;
}

class Item {
	constructor(UUIDitemstring, costo) {
		this.UUIDitem = UUIDitemstring;
		this.cost = parseInt(costo);
	}
}

class State {

	constructor(destiny, vuelo, hotel, type, cost) {
		this.destiny = destiny;
		this.vuelo = vuelo;
		this.hotel = hotel;
		this.type = type;
		this.cost = cost;
	}

	getVueloUUID() {
		return this.destiny.vuelosordered[this.vuelo].UUIDitem;
	}

	getHotelUUID() {
		return this.destiny.hotelesordered[this.hotel].UUIDitem;
	}

	succesors(){
		if (this.type) {
			if (this.vuelo < (this.destiny.vuelosordered.length - 1)) {
				if (this.hotel < (this.destiny.hotelesordered.length - 1)) {
					return [
						new State(this.destiny, this.vuelo + 1, this.hotel, 0,
							this.destiny.cost(this.vuelo + 1, this.hotel)),
							new State(this.destiny, this.vuelo, this.hotel + 1, 1,
								this.destiny.cost(this.vuelo, this.hotel + 1)) ];

				}
				return [new State(this.destiny, this.vuelo + 1, this.hotel, 0,
					this.destiny.cost(this.vuelo + 1, this.hotel))];
			}
			if (this.hotel < (this.destiny.hotelesordered.length - 1)) {
				return [new State(this.destiny, this.vuelo, this.hotel + 1, 1,
					this.destiny.cost(this.vuelo, this.hotel + 1)) ];

			}
		} else {// type==UP
			if (this.vuelo < (this.destiny.vuelosordered.length - 1))
				return [new State(this.destiny, this.vuelo + 1, this.hotel, 0,
				this.destiny.cost(this.vuelo + 1, this.hotel))];
		}

		return [];
	}
}

class Destiny {
		constructor(vuelos, hoteles) {
			this.vuelos = vuelos;
			this.hoteles = hoteles;
			this.vuelosordered = [];
			this.hotelesordered = [];
		}

		/*Item[] vuelosordered;
		Item[] hotelesordered;*/
		cost(posvuelo, poshotel){
			return this.vuelosordered[posvuelo].cost + this.hotelesordered[poshotel].cost;
		}

		sort(){
			this.vuelos.sort(function (a,b) {
				return a.cost - b.cost;
			});
			this.hoteles.sort(function (a,b) {
				return a.cost - b.cost;
			});
			this.vuelosordered = this.vuelos;
			this.hotelesordered = this.hoteles;
		}
}

let fs = require('fs');
let open = new FastPriorityQueue(orderDesc);
let close = new FastPriorityQueue(orderAsc);

function initializeSolutions(entries) {
	let initialAdded = 0;

	for (let property in entries) {
		if (entries.hasOwnProperty(property)) {
			initialAdded++;
			let destiny = entries[property];
			destiny.sort();

			let initialcost = destiny.cost(0, 0);
			//console.log("InitialAdded, Cost: "+initialAdded+","+initialcost);
			if (initialcost <= COST_LIMIT) {
				open.add(new State(destiny, 0, 0, 1, initialcost));
			}
		}
	}
	//console.log("initialAdded: "+initialAdded);

// Execute first 40000 solutions

	let firstSolutions = [];//new State[MAX_COMBINACIONES];
	let current;
	for (let position = 0; position < MAX_COMBINACIONES ; position++) {
		current = open.poll();
		current.filePosition = position;
		close.add(current);
		firstSolutions.push(current);
		let succesors = current.succesors();
		for (let e=0 ; e<succesors.length ; e++) {
			let succesor = succesors[e];
			if (succesor.cost <= COST_LIMIT) {
				open.add(succesor);
			}
		}
	}

	return firstSolutions;
}

function printSolutions(close){
	while(!close.isEmpty()){
		console.log(close.poll().cost);
	}
}

//TODO agregar medidor de tiempo
function main() {
	let entries = {};
	// Load dataset and init open set
	let lineReader = require('readline').createInterface({
		input: require('fs').createReadStream(INPUT_FILE)
	});
	lineReader.on('line', function (line) {
		let entry = line.split(",");
		let uuiddestiny = entry[2];
		if (typeof entries[uuiddestiny] == "undefined") {
			entries[uuiddestiny] = new Destiny([], []);
		}
		if (entry[1].charAt(0) === 'V') {
			entries[uuiddestiny].vuelos.push(new Item(entry[0], entry[3]));
		} else {
			entries[uuiddestiny].hoteles.push(new Item(entry[0], entry[3]));
		}
	});


	lineReader.on('close', function () {

		let firstSolutions2 = initializeSolutions(entries);

		saveSolution(firstSolutions2);

	});


}


function saveSolution(firstSolutions){

	let outputFile = fs.openSync(OUTPUT_FILE,'w');

	for(let i = 0; i< firstSolutions.length; i++){
		writeFile(firstSolutions[i],outputFile);
	}

	// Continue execution
	let iter = 0;
	while (!open.isEmpty()) {
		let current = open.poll();
		let worst = close.peek();
		if (worst.cost < current.cost) {
			close.poll();
			current.filePosition = worst.filePosition;
			close.add(current);
			writeFile(current,outputFile);
		}

		let succesors = current.succesors();
		for (let e=0 ; e<succesors.length ; e++) {
			let succesor = succesors[e];
			if (succesor.cost <= COST_LIMIT) {
				open.add(succesor);
			}
		}
		iter++;
	}
}

/*private static void writeFile(State[] firstSolutions) throws IOException {
	byte[] content=new byte[firstSolutions.length*LINE_IN_BYTES];
	for(int i=0;i<firstSolutions.length;i++){
		State current = firstSolutions[i];
		System.arraycopy(current.getVueloUUID().toString().getBytes(StandardCharsets.US_ASCII), 0, content, i*LINE_IN_BYTES, 36);
		content[i*LINE_IN_BYTES+36]=COMMA;
		System.arraycopy(current.getHotelUUID().toString().getBytes(StandardCharsets.US_ASCII), 0, content, i*LINE_IN_BYTES+37, 36);
		content[i*LINE_IN_BYTES+73]=NEWLINE;
	}
	outputFile.write(content);
}*/

function writeFile(current,outputFile){
	let line = current.getVueloUUID() + "," + current.getHotelUUID() + "\n";
	fs.writeSync(outputFile,line,current.filePosition * LINE_IN_BYTES);
}

main();