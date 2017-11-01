/**
 * Created by Usuarioç on 31/10/2017.
 */
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const fs = require('fs').cpus.length;

fs.open(path, flags, [mode], callback)
fs.write(fd, buffer, offset, length, position, callback)
fs.writeSync(fd, buffer, offset, length, position)
fs.read(fd, buffer, offset, length, position, callback)
fs.readSync(fd, buffer, offset, length, position)

let maxLoop = 4;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    return;

} else {

        for(i=0;i<10000;i++) {
            console.log(i);
        }
        return;

}