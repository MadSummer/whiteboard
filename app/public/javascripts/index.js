//draw.init('canvas', 'whiteboard');
var draw;
$(document).ready(function () {
  var width = parseInt($('#whiteboard').css('width'));
  var height = parseInt($('#whiteboard').css('height')) || 600;
  $('#whiteboard').attr('width', width);
  $('#whiteboard').attr('height', height);
  wb = new WhiteBoard({
    ratio:.5,
    id: 'whiteboard',
    stroke: 'red', 
    generateID: function () {
      return (Math.random() * 100000);
    },
    width: 892,
    height: 1263,
    maxSize:8192,
    wrap: '#canvas-scroll-wp',
    allowDrawing:true
  });
  wb.loadBackgroundImage('http://rongkeossdev.oss-cn-beijing.aliyuncs.com/130914483085248512/aba2b52cf2c9cb6f3bb20c7830e65a42/4.jpg');
  wb.ep.on('mousedown', function () {
    //console.log('mouse:down')
  });
  wb.ep.on('mouseup', function () {
    //console.log('mouse:up')
  });
  wb.ep.on('mousemove', function () {
    //console.log('mouse:move')
  });
  wb.ep.on('objectAdded', function (obj) {
    //console.log('object:added')
    var target = obj.target;
    if (target.from == 'out') return;
    var data = target.exportKeyAttr();
    sync({
      action: 'add',
      data: data
    })
  });
  wb.ep.on('objectRemoved', function (obj) {
    sync({
      action: 'remove',
      data: {
        id: obj.target.id
      }
    })
  });
  wb.ep.on('clear', function (obj) {
    if (obj.from == 'out') return;
    sync({
      action: 'clear'
    })
  });
  // 注册事件
  $('#drawController').on('click', function (e) {
    var type = $(e.target).attr('data-type');
    var action = $(e.target).attr('data-action')
    if (type) {
      $('#drawController i').removeClass('active');
      $(e.target).addClass('active');
      wb.set({
        type: type
      })
    }
    if (action) {
      if (action === 'clear') {
        wb.clear({
          from: 'draw',
          removeBg: false
        });
      }
      if (action === 'size') {
        wb.set({
          strokeWidth: parseInt($(e.target).text())
        })
      }
      if (action === 'undo') {
        wb.undo();
      }
      if (action === 'redo') {
        wb.redo();
      }
    }
  });
  $('#chooseColor').on('change', function () {
    wb.set({
      stroke: $(this).val()
    })
  })
  $('.size').hover(function () {
    $(this).find('ul').removeClass('hidden')
  }, function () {
    $(this).find('ul').addClass('hidden')
  })
  $('.upper-canvas').click(function (e) {
    if (wb.type == 'text' && $('#input').is(':hidden')) {
      $('#input').css({
        'top': e.clientY,
        'left': e.clientX
      }).show().focus();
      $('#input').attr('data-x', wb.startX);
      $('#input').attr('data-y', wb.startY);
    } else {
      $('#input').hide();
    }
  });
  $('#input').blur(function () {
    if ($.trim($(this).val()) == '') {
      return;
    }
    var x = +$(this).attr('data-x');
    var y = +$(this).attr('data-y');
    wb.text($(this).val(), x, y);
    $(this).val('');
  })
  // 
  //
  // 监听 
  var socket = io.connect( window.location.hostname + ':4008');
  socket.on('server', function (msg) {
    switch (msg.action) {
      case 'add':
        wb.render(msg.data)
        break;
      case 'remove':
        wb.remove({
          id: msg.data.id,
        });
        break;
      case 'clear':
        wb.clear({
          removeBg: false,
          from: 'out'
        });
        break;
      case 'member':
        $('#member').text(msg.data)
        break;
      default:
        break;
    }
  })
  socket.on('history', function (msg) {
    for (var k in msg) {
      wb.render(msg[k])
    }
  })

  function sync(opt) {
    socket.emit('client', opt)
  }
  window.sync = sync;
});