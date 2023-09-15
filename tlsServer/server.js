'use strict';

const tls = require('node:tls');
const fs = require('node:fs');

const PORT = 12345;
const HOST = 'localhost';

const key = fs.readFileSync('./cert/key.pem');
const cert = fs.readFileSync('./cert/cert.pem');

tls.createServer({ key, cert }, (cleartextStream) => {
  console.log({ cleartextStream });
  console.log('Client connected.');

  cleartextStream.setEncoding('utf8');

  cleartextStream.on('data', (data) => {
    console.log(`Received message: ${data}`);
    cleartextStream.write('Hello from server!\n');
  });

  cleartextStream.on('end', () => {
    console.log('Cient disconnected.');
  });
}).listen(PORT, HOST, () => {
  console.log(`TLS server listening on ${HOST}:${PORT}`);
});
