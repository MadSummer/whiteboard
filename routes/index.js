'use strict';
let express = require('express');
let router = express.Router();

let server = require('http').createServer(function () { }).listen(7777)
let io = require('socket.io')(server);
io.sockets.on('connection', function (socket) {
  io.sockets.emit('server', {
    type: 'member',
    data: io.engine.clientsCount
  });
  socket.on('disconnect', function () {
    io.sockets.emit('server', {
      type: 'member',
      data: io.engine.clientsCount
    });
  });
  socket.on('client', function (data) {
    switch (data.type) {
      case 'add':
        
        break;
    
      default:
        break;
    }
    socket.broadcast.emit('server', data)
  });
});
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: '电子白板Demo'
  });
});

module.exports = router;
