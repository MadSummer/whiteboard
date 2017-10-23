/*
 * @Author: Liu Jing 
 * @Date: 2017-10-23 15:40:23 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-10-23 15:59:29
 */
const http = require('http');
const config = require('../config');
const fs = require('fs');
const path = require('path');
let allObject = {};
let js = fs.readFileSync(path.join(__dirname,'../', '/app/public/javascripts/index.js'), 'utf-8');
fs.writeFileSync(path.join(__dirname,'../', '/app/public/javascripts/index.js'), js.replace(/\'\:\d{2,6}\'/, `':${config.socketPort}'`.toString()), 'utf-8');

let server = http.createServer(function (req, res) {
  res.writeHead(200, {
    'Content-type': 'text/html'
  });
  res.end('socket.io');
}).listen(config.socketPort);
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
