const http = require('http');
let allObject = {};
let server = http.createServer(function (req, res) {
  res.writeHead(200, {
    'Content-type': 'text/html'
  });
  res.end('socket.io');
}).listen(4000);
let io = require('socket.io')(server);
io.on('connection', function (socket) {
  io.sockets.emit('server', {
    action: 'member',
    data: io.engine.clientsCount
  });
  socket.emit('history', allObject)
  socket.on('disconnect', function () {
    io.sockets.emit('server', {
      action: 'member',
      data: io.engine.clientsCount
    });
  });
  socket.on('client', function (msg) {
    switch (msg.action) {
      case 'add':
        allObject[msg.data.id.toString()] = msg.data;
        break;
      case 'remove':
        delete allObject[msg.data.id.toString()];
        break;
      case 'clear':
        allObject = {}
        break;
      default:
        break;
    }
    socket.broadcast.emit('server', msg)
  });
});
