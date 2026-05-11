import http from 'http';
const port = process.argv[2] || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('hello world');
}).listen(port, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
  process.exit(0);
}).on('error', (err) => {
  console.error(`Error on port ${port}: ${err.message}`);
  process.exit(1);
});
