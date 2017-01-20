//draw.init('canvas', 'whiteboard');
var draw
$(document).ready(function () {
  var width = parseInt($('#whiteboard').css('width'));
  var height = parseInt($('#whiteboard').css('height')) || 600;
  $('#whiteboard').attr('width', width);
  $('#whiteboard').attr('height', height);
  wb = new WhiteBoard({
    id: 'whiteboard',
    strokeColor: 'red'
  });
  wb.ep.on('mouse:down', function () {
    console.log('mouse:down')
  });
  wb.ep.on('mouse:up', function () {
    console.log('mouse:up')
  });
  wb.ep.on('mouse:move', function () {
    console.log('mouse:move')
  });
  wb.ep.on('object:added', function (obj) {
    console.log(obj)
  });
  wb.ep.on('object:removed', function (obj) {
    console.log(obj)
  });
  wb.ep.on('objects:removed', function (obj) {
    console.log(obj)
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
        wb.clear()
      }
      if (action === 'size') {
        wb.set({
          strokeWidth: parseInt($(e.target).text())
        })
      }
    }
  });
  $('#chooseColor').on('change', function () {
    wb.set({
      strokeColor: $(this).val()
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
  var socket = io.connect('http://192.168.1.38:7777');
  socket.on('server', function (msg) {
    switch (msg.type) {
      case 'member':
        $('#member').text(msg.data);
        break;
      case 'add':
        fabric.util.enlivenObjects([msg.obj], function (objects) {
          objects.forEach(function (o) {
            wb.canvas.add(o);
          });
        });
        break;
      case 'eraser':
        draw.canvas.remove(wb.canvas.item(msg.index));
        break;
      case 'clear':
        wb.clear();
        break;
      case 'undo':
        wb.undo();
        break;
      case 'redo':
        wb.redo();
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