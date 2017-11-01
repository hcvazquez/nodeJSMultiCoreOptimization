/*package com.nodeconf17.monolitic;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.PriorityQueue;
import java.util.TreeSet;
import java.util.UUID;*/


	
const INPUT_FILE="./dataset.csv";
const OUTPUT_FILE="./combos.csv";

const MAX_COMBINACIONES = 40000;
const COST_LIMIT = 30000;
const LINE_IN_BYTES = (36 + 1 + 36 + 1);
//const COMMA = ",".getBytes(StandardCharsets.US_ASCII)[0];
//const NEWLINE = "\n".getBytes(StandardCharsets.US_ASCII)[0];

function compareCosts(a,b) {
	return a.cost - b.cost;
}

function compareStateSolution(a,b) {
	return b.cost < a.cost;
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
			this.vuelos.sort(compareCosts);
			this.hoteles.sort(compareCosts);
			this.vuelosordered = this.vuelos;
			this.hotelesordered = this.hoteles;
		}
}

function initializeSolutions(entries) {

	let FastPriorityQueue = require("./FastPriorityQueue");
	let open = new FastPriorityQueue(compareStateSolution);
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
	let close = new FastPriorityQueue(compareCosts);

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

	console.log("pool size "+ close.size);

	return close;
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
	let fs = require('fs');
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
		/*for (let property in entries) {
			if (entries.hasOwnProperty(property)) {
				console.log(entries[property]);
			}
		}*/
		//console.log(Object.keys(entries).length);

		let close = initializeSolutions(entries);

		//printSolutions(close);

		/*console.log("c1,c2,c3: "+ c1 +","+ c2 +","+ c3 );
		console.log(lines);*/


	});


}

main();


/*
	outputFile = new RandomAccessFile(OUTPUT_FILE, "rw");
	outputFile.setLength(40000 * LINE_IN_BYTES);
	writeFile(firstSolutions);

	// Continue execution
	while ((current = open.poll()) != null) {

		State worst = close.peek();
		if (worst.cost < current.cost) {
			close.poll();
			current.filePosition = worst.filePosition;
			close.add(current);

			writeFile(current);
		}

		State[] succesors = current.succesors();

		for (State succesor : succesors) {
			if (succesor.cost <= COST_LIMIT)
				open.add(succesor);
		}
	}

	outputFile.close();
}

private static void writeFile(State[] firstSolutions) throws IOException {
	byte[] content=new byte[firstSolutions.length*LINE_IN_BYTES];
	for(int i=0;i<firstSolutions.length;i++){
		State current = firstSolutions[i];
		System.arraycopy(current.getVueloUUID().toString().getBytes(StandardCharsets.US_ASCII), 0, content, i*LINE_IN_BYTES, 36);
		content[i*LINE_IN_BYTES+36]=COMMA;
		System.arraycopy(current.getHotelUUID().toString().getBytes(StandardCharsets.US_ASCII), 0, content, i*LINE_IN_BYTES+37, 36);
		content[i*LINE_IN_BYTES+73]=NEWLINE;
	}
	outputFile.write(content);
}

private static void writeFile(State current) throws IOException {
	outputFile.seek(current.filePosition * LINE_IN_BYTES);

	byte[] line=new byte[LINE_IN_BYTES];
	System.arraycopy(current.getVueloUUID().toString().getBytes(StandardCharsets.US_ASCII), 0, line, 0, 36);
	line[36]=COMMA;
	System.arraycopy(current.getHotelUUID().toString().getBytes(StandardCharsets.US_ASCII), 0, line, 37, 36);
	line[73]=NEWLINE;

	outputFile.write(line);
}
*/
