'use strict';

const tls = require('node:tls');
const fs = require('node:fs');

const PORT = 12345;
const HOST = 'localhost';

const key = fs.readFileSync('./cert/key.pem');
const cert = fs.readFileSync('./cert/cert.pem');

const options = { key, cert, rejectUnauthorized: false };

const client = tls.connect(PORT, HOST, options, () => {
  console.log('Connect to server.');
  client.write('Hello from client!\n');
});

client.setEncoding('utf8');

client.on('data', (data) => {
  console.log(`Received message: ${data}`);
  client.end();
});

client.on('end', () => {
  console.log('Disconnected from server.');
});
