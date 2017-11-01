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
		constructor(/*TreeSet<Item>*/vuelos, /*TreeSet<Item>*/ hoteles) {
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
	}

function initializeSolutions(entries) {

	function compareCosts(a,b) {
		return a.cost < b.cost;
	}

	function compareStateSolution(a,b) {
		return b.cost < a.cost;
	}

	var FastPriorityQueue = require("./FastPriorityQueue");

	var open = new FastPriorityQueue(compareStateSolution);


	for (var property in entries) {
		var destiny = entries[property];
		console.log("vuelos = "+destiny.vuelos);
		console.log("hoteles = "+destiny.hoteles);
		console.log("id, property = "+property);
		destiny.vuelosordered = destiny.vuelos.sort(compareCosts);
		destiny.hotelesordered = destiny.hoteles.sort(compareCosts);

		var initialcost = destiny.cost(0, 0);

		if (initialcost <= COST_LIMIT) {
			open.add(new State(destiny, 0, 0, 1, initialcost));
		}
	}

// Execute first 40000 solutions
	/*var close = new FastPriorityQueue(compareCosts);

	var firstSolutions = [];//new State[MAX_COMBINACIONES];
	var current;
	for (var position = 0; position < MAX_COMBINACIONES; position++) {
		current = open.poll();
		current.filePosition = position;
		close.add(current);
		firstSolutions.push(current);
		var succesors = current.succesors();
		for (var succesor in succesors) {
			if (succesor.cost <= COST_LIMIT)
				open.add(succesor);
		}
	}*/

	return open;
}

function printSolutions(close){
	while(!close.isEmpty()){
		console.log(close.poll().cost);
	}
}

//TODO agregar medidor de tiempo
function main() {
	var entries = {};
	// Load dataset and init open set
	var fs = require('fs');
	var lineReader = require('readline').createInterface({
		input: require('fs').createReadStream(INPUT_FILE)
	});
	/*var c1 = 0;
	var c2 = 0;
	var c3 = 0;
	var lines = 0;*/
	lineReader.on('line', function (line) {
//		lines++;
		var entry = line.split(",");
		var uuiddestiny = entry[2];
		if (typeof entries[uuiddestiny] == "undefined") {
		//	c1++;
			entries[uuiddestiny] = new Destiny([], []);
		}
		if (entry[1].charAt(0) === 'V') {
		//	c2++;
			entries[uuiddestiny].vuelos.push(new Item(entry[0], entry[3]));
		} else {
		//	c3++;
			entries[uuiddestiny].hoteles.push(new Item(entry[0], entry[3]));
		}
	});


	lineReader.on('close', function () {
		/*for (var property in entries) {
			if (entries.hasOwnProperty(property)) {
				console.log(entries[property]);
			}
		}*/
		//console.log(Object.keys(entries).length);

		var close = initializeSolutions(entries);

		printSolutions(close);

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
