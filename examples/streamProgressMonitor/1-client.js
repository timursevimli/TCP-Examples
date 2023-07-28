'use strict';

const net = require('node:net');
const fs = require('node:fs');
const path = require('node:path');

const socket = net.createConnection(1418, 'localhost');

let isReadyToWrite = false;
let metadata = null;
let ws = null;
let receivedBytes = 0;

const createWritable = () => {
  const filename = path.basename(metadata.filename);
  ws = fs.createWriteStream(filename);
  isReadyToWrite = true;
};

const getMetadata = (data) => {
  try {
    const { size, filename } = JSON.parse(data);
    metadata = { size, filename };
  } catch (e) {
    console.log(e);
  }
};

const monitoringDownloadProgress = (data) => {
  receivedBytes += data.byteLength;
  const { size } = metadata;
  const progress = Math.floor((receivedBytes / size) * 100);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Download Progress: ${progress}%`);
  if (receivedBytes === size) console.log('\nDownload finished!');
};

socket.on('data', (buffer) => {
  if (isReadyToWrite) {
    monitoringDownloadProgress(buffer);
    ws.write(buffer);
    return;
  }
  getMetadata(buffer);
  createWritable();
});

socket.on('error', console.error);

socket.on('connect', () => {
  console.log('Client connected to server!');
  socket.write('Hello from client!');
});
