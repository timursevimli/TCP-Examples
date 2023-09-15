'use strict';

const net = require('node:net');
const fs = require('node:fs');
const { setTimeout } = require('node:timers/promises');

const PORT = 1418;

const filename = '../video.mp4';
const { size } = fs.statSync(filename);

const addSocketHandlers = (socket) => {
  socket.setNoDelay(true);
  console.log('Client connected:', socket.remoteAddress);
  socket.on('error', console.error);
  socket.on('data', (buffer) => {
    console.log('data: ', buffer.toString());
  });
  socket.on('close', () => {
    console.log('\nClient disconnected:', socket.remoteAddress);
  });
};

const metadata = { size, filename };

// TODO convert this fn to transform stream and pipe from this
const monitoringUploadProgress = (stream) => {
  let uploadedBytes = 0;
  stream.on('data', (chunk) => {
    uploadedBytes += chunk.length;
    const progress = Math.floor((uploadedBytes / size) * 100);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Upload Progress: ${progress}%`);
  });
};

const server = net.createServer(async (socket) => {
  addSocketHandlers(socket);
  socket.write(JSON.stringify(metadata));
  await setTimeout(1000);
  const rs = fs.createReadStream(filename);
  monitoringUploadProgress(rs);
  rs.pipe(socket);
  rs.on('error', console.error);
  rs.on('end', () => {
    console.log('\nUpload finished!');
    socket.end();
  });
});

server.on('error', console.error);
server.on('drop', console.log);
server.maxConnections = 3;
server.listen(PORT, () => void console.log('Server listening on port:', PORT));

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});
