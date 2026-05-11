import http from 'http';
const server = http.createServer((req, res) => {
  res.end('ok');
});
server.listen(3000, '::1', () => {
  console.log(`Listening on [::1]:3000`);
  process.exit(0);
});
server.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
