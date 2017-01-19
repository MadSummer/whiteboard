//draw.init('canvas', 'whiteboard');
var draw
$(document).ready(function () {
  var width = parseInt($('#whiteboard').css('width'));
  var height = parseInt($('#whiteboard').css('height')) || 600;
  $('#whiteboard').attr('width', width);
  $('#whiteboard').attr('height', height);
  draw = new Draw({
    id: 'whiteboard'
  });
  draw.init({
    strokeColor:'red'
  });

  // 注册事件
  $('#drawController').on('click', function (e) {
    var type = $(e.target).attr('data-type');
    var action = $(e.target).attr('data-action')
    if (type) {
      $('#drawController i').removeClass('active');
      $(e.target).addClass('active');
      draw.setting = {
        type: type
      }
    }
    if (action) {
      if (action === 'clear') {
        draw.clear()
      }
      if (action === 'size') {
        draw.setting = {
          strokeWidth:parseInt($(e.target).text())
        }
      }
    }
  });
  $('#chooseColor').on('change', function () {
    draw.setting = {
      strokeColor: $(this).val()
    }
  })
  $('.size').hover(function () {
    $(this).find('ul').removeClass('hidden')
  }, function () {
    $(this).find('ul').addClass('hidden')
  })
  $('.upper-canvas').click(function (e) {
    if (draw.type == 'text' && $('#input').is(':hidden')) {
      $('#input').css({
        'top': e.clientY,
        'left': e.clientX
      }).show().focus();
      $('#input').attr('data-x', draw.startX);
      $('#input').attr('data-y', draw.startY);
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
    draw.text($(this).val(), x, y);
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
            draw.canvas.add(o);
          });
        });
        break;
      case 'eraser':
        draw.canvas.remove(draw.canvas.item(msg.index));
        break;
      case 'clear':
        draw.clear();
        break;
      case 'undo':
        draw.undo();
        break;
      case 'redo':
        draw.redo();
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