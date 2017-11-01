class Destiny {
    constructor(vuelos, hoteles) {
        this.vuelos = vuelos;
        this.hoteles = hoteles;
    }
}

let destinies = [ new Destiny(["A","B","C"],["D"])
                , new Destiny(["A"],["B","C","D","E"])];

for(let i=0; i<destinies.length ; i++){
    let destini = destinies[i];
    console.log("vuelos = "+destini.vuelos.length);
    console.log("hoteles = "+destini.hoteles.length);
}

