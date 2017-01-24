//draw.init('canvas', 'whiteboard');
var draw;
$(document).ready(function () {
  var width = parseInt($('#whiteboard').css('width'));
  var height = parseInt($('#whiteboard').css('height')) || 600;
  $('#whiteboard').attr('width', width);
  $('#whiteboard').attr('height', height);
  wb = new WhiteBoard({
    id: 'whiteboard',
    stroke: 'red',
    generateID: function () {
      return (Math.random() * 100000);
    }
  });
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
    var target = obj.target;
    if (target.from == 'out') return;
    var data = {
      stroke: target.stroke,
      fill: target.fill,
      strokeWidth: target.strokeWidth,
      id: target.id,
      type: target.type,
      from:target.from
    }
    switch (target.type) {
      case 'line':
        data.x1 = target.x1;
        data.x2 = target.x2;
        data.y1 = target.y1;
        data.y2 = target.y2;
        break;
      case 'circle':
        data.top = target.top;
        data.left = target.left;
        data.radius = target.radius;
        break;
      case 'rect':
        data.width = target.width;
        data.height = target.height;
        data.top = target.top;
        data.left = target.left;
        break;
      case 'path':
        data.path = target.path.join(' ').replace(/,/g, ' ');
        data.height = target.height;
        data.top = target.top;
        data.left = target.left;
        break;
      default:
        break;
    }
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
        wb.clear();
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
  var socket = io.connect('http://192.168.1.38:3000');
  socket.on('server', function (msg) {
    switch (msg.action) {
      case 'add':
        msg.data.trigger = false;
        wb.render(msg.data)
        break;
      case 'remove':
        wb.remove({
          id: msg.data.id,
        });
        break;
      case 'clear':
        wb.clear();
        break;
      default:
        break;
    }
  })

  function sync(opt) {
    socket.emit('client', opt)
  }
  window.sync = sync;
});