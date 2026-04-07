const { Client } = require('ssh2');
const net = require('net');

const conn = new Client();
conn.on('ready', () => {
  const server = net.createServer((sock) => {
    conn.forwardOut(
      sock.remoteAddress, sock.remotePort,
      'dados_tronnus', 5432,
      (err, stream) => {
        if (err) return sock.end();
        stream.on('error', () => {}); // ignore
        sock.on('error', () => {}); // ignore
        sock.pipe(stream).pipe(sock);
      }
    );
  }).listen(5558, '127.0.0.1', () => {
    console.log('TUNNEL_READY');
  });
}).on('error', (err) => {
    console.error('Connection error: ', err);
}).connect({
    host: '45.227.61.197',
    port: 22,
    username: 'bravvius',
    password: 'T$C5&~+alWo70l^7'
});
