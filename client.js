const { Socket } = require("net");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
})

const END = 'END';

const error = (message) => {
  console.log(message);
  process.exit(1);
};

const chooseName = (socket) => {
  readline.question('Choose your username: ', (username) => {
    socket.write(username);
    console.log(`Type any message to send it, type ${END} to exit`)
  });
}

const connect = (host, port) => {
  console.log(`Connecting to ${host}:${port}`);

  const socket = new Socket();
  socket.connect({ host: host, port: port })
  socket.setEncoding('utf-8')

  socket.on('connect', () => {
    console.log("Connected");

    chooseName(socket);

    readline.on('line', (message) => {
      socket.write(message)
      if (message === END) {
        socket.end();
        console.log('Disconnected')
      }
    });
  
    socket.on('data', (data) => {
      if (data === 'ERR') {
        console.log('Username already taken');
        chooseName(socket);
      } else {
        console.log(data);
      }
    });
  })

  socket.on('error', (err) => error(err.message));

  socket.on('close', () => { process.exit(0) })
}

const main = () => {
  if (process.argv.length !== 4) {
    error(`Usage: node ${__filename} host port`);
  }

  let [, , host, port] = process.argv;
  if (isNaN(port)) {
    error(`Invalid port ${port}`);
  }
  port = Number(port);

  connect(host, port);
}

if (require.main === module) {
  main();
}