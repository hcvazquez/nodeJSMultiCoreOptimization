package com.nodeconf17.monolitic;

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
import java.util.UUID;

public class AlMundoMainMonolitic {
	
	public static final String INPUT_FILE="./dataset.csv";
	public static final String OUTPUT_FILE="./combos.csv";

	public static final int MAX_COMBINACIONES = 40000;
	public static final int COST_LIMIT = 30000;
	public static final int LINE_IN_BYTES = (36 + 1 + 36 + 1);
	public static final byte COMMA = ",".getBytes(StandardCharsets.US_ASCII)[0];
	public static final byte NEWLINE = "\n".getBytes(StandardCharsets.US_ASCII)[0];

	public static class Item implements Comparable<Item>{
		public Item(String UUIDitemstring, String cost) {
			this.UUIDitem = UUID.fromString(UUIDitemstring);
			this.cost = Integer.valueOf(cost);
		}

		public UUID UUIDitem;
		public int cost;
		@Override
		public int compareTo(Item o) {
			return Integer.compare(this.cost, o.cost);
		}
	}

	public static class State implements Comparable<State>{
		public Destiny destiny;
		public int vuelo;
		public int hotel;

		public StateType type;

		public static enum StateType {
			RIGHTUP, UP
		};

		public int cost;
		public int filePosition;

		public State(Destiny destiny, int vuelo, int hotel, StateType type, int cost) {
			this.destiny = destiny;
			this.vuelo = vuelo;
			this.hotel = hotel;
			this.type = type;
			this.cost = cost;
		}

		public UUID getVueloUUID() {
			return this.destiny.vuelosordered[this.vuelo].UUIDitem;
		}

		public UUID getHotelUUID() {
			return this.destiny.hotelesordered[this.hotel].UUIDitem;
		}

		public State[] succesors() {
			if (this.type == StateType.RIGHTUP) {
				if (this.vuelo < (this.destiny.vuelosordered.length - 1)) {
					if (this.hotel < (this.destiny.hotelesordered.length - 1)) {
						return new State[] {
								new State(this.destiny, this.vuelo + 1, this.hotel, StateType.UP,
										this.destiny.cost(this.vuelo + 1, this.hotel)),
								new State(this.destiny, this.vuelo, this.hotel + 1, StateType.RIGHTUP,
										this.destiny.cost(this.vuelo, this.hotel + 1)) };

					}
					return new State[] { new State(this.destiny, this.vuelo + 1, this.hotel, StateType.UP,
							this.destiny.cost(this.vuelo + 1, this.hotel)) };
				}
				if (this.hotel < (this.destiny.hotelesordered.length - 1)) {
					return new State[] { new State(this.destiny, this.vuelo, this.hotel + 1, StateType.RIGHTUP,
							this.destiny.cost(this.vuelo, this.hotel + 1)) };

				}
			} else {// type==UP
				if (this.vuelo < (this.destiny.vuelosordered.length - 1))
					return new State[] { new State(this.destiny, this.vuelo + 1, this.hotel, StateType.UP,
							this.destiny.cost(this.vuelo + 1, this.hotel)) };
			}
			
			return new State[]{};
		}

		@Override
		public int compareTo(State o) {
			return Integer.compare(o.cost, this.cost);
		}
	}

	public static class Destiny {
		public Destiny(TreeSet<Item> vuelos, TreeSet<Item> hoteles) {
			this.vuelos = vuelos;
			this.hoteles = hoteles;
		}

		TreeSet<Item> vuelos;
		TreeSet<Item> hoteles;
		Item[] vuelosordered;
		Item[] hotelesordered;

		public int cost(int posvuelo, int poshotel) {
			return vuelosordered[posvuelo].cost + hotelesordered[poshotel].cost;
		}
	}

	static RandomAccessFile outputFile;

	public static void main(String[] args) throws IOException {
		long initialTime=System.nanoTime();

		// Load dataset and init open set
		BufferedReader reader = new BufferedReader(new FileReader(INPUT_FILE));

		PriorityQueue<State> open = new PriorityQueue<>();

		Map<UUID, Destiny> entries = new HashMap<>();
		
		String line;
		while(( line=reader.readLine())!=null){
			String[] entry=line.split(",");
			UUID uuiddestiny = UUID.fromString(entry[2]);
			if (!entries.containsKey(uuiddestiny)) {
				entries.put(uuiddestiny,
						new Destiny(new TreeSet<Item>(), new TreeSet<Item>()));
			}
			if (entry[1].charAt(0) == 'V') {
				entries.get(uuiddestiny).vuelos.add(new Item(entry[0], entry[3]));
			} else {
				entries.get(uuiddestiny).hoteles.add(new Item(entry[0], entry[3]));
			}
		}

		for (Entry<UUID, Destiny> entry : entries.entrySet()) {
			Destiny destiny = entry.getValue();
			destiny.vuelosordered = destiny.vuelos.toArray(new Item[] {});
			destiny.hotelesordered = destiny.hoteles.toArray(new Item[] {});

			int initialcost = destiny.cost(0, 0);
			if (initialcost <= COST_LIMIT)
				open.add(new State(destiny, 0, 0, State.StateType.RIGHTUP, initialcost));

		}

		// Execute first 40000 solutions
		PriorityQueue<State> close = new PriorityQueue<>(MAX_COMBINACIONES, new Comparator<State>() {
			@Override
			public int compare(State o1, State o2) {
				return Integer.compare(o1.cost, o2.cost);
			}
		});

		State[] firstSolutions = new State[MAX_COMBINACIONES];
		State current;
		for (int position = 0; position < MAX_COMBINACIONES; position++) {
			current = open.poll();
			current.filePosition = position;
			close.add(current);
			firstSolutions[position]=current;

			State[] succesors = current.succesors();

			for (State succesor : succesors) {
				if (succesor.cost <= COST_LIMIT)
					open.add(succesor);
			}
		}
		
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
		
		long lapseTime=System.nanoTime()-initialTime;
		System.out.println(((double)lapseTime)/1000000000+" seconds");
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
}
