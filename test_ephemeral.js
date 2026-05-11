import http from 'http';
const server = http.createServer((req, res) => {
  res.end('ok');
});
server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  console.log(`Port: ${address.port}`);
  process.exit(0);
});
server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
