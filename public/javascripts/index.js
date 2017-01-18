//draw.init('canvas', 'whiteboard');
var draw
$(document).ready(function () {
  var width = parseInt($('#whiteboard').css('width'));
  var height = parseInt($('#whiteboard').css('height')) || 600;
  $('#whiteboard').attr('width', width);
  $('#whiteboard').attr('height', height);
  draw = new Draw({ id: 'whiteboard' });
  draw.init();

  // 注册事件
  $('#drawController').on('click', function (e) {
    var type = $(e.target).attr('data-type');
    $('#drawController i').removeClass('active');
    $(e.target).addClass('active');
    //fabric.Object.prototype.selectable = false;
    //draw.canvas.perPixelTargetFind = true;
    /*if (opt) {
      fabric.Object.prototype.selectable = true;
      draw.canvas.perPixelTargetFind = false;
    }*/
    switch (type) {
      case 'pencil':
        draw.canvas.fire('setting:modified', {
          type:'pencil'
        })
        break;
      case 'line':
        draw.canvas.fire('setting:modified', {
          type:'line'
        })
        break;
      case 'clear':
        draw.canvas.fire('setting:modified', {
          type:'clear'
        })
        break;
      case 'size':
        draw.canvas.fire('setting:modified', {
          lineWidth: parseInt($(e.target).text())
        })
        break;
      case 'eraser':
        draw.canvas.fire('setting:modified', {
          type: 'eraser'
        })
        break;
      default:
        break;
    }
  });
  document.getElementById('chooseColor').onchange = function () {
    var color = this.value;
    draw.canvas.fire('setting:modified', {
      color:$(this).val()
    })
  }
  $('.size').hover(function () {
    $(this).find('ul').removeClass('hidden')
  }, function () {
    $(this).find('ul').addClass('hidden')
  })
  draw.canvas.on('mouse:down', draw.mousedown);
  draw.canvas.on('mouse:move', draw.mousemove);
  draw.canvas.on('mouse:up', draw.mouseup);
  draw.canvas.on('object:added', draw.addObject);
  draw.canvas.on('object:modified', draw.modifiedObject);
  draw.canvas.on('object:removed', draw.removeObject);
  draw.canvas.on('object:selected', draw.selectObject);
  $('.upper-canvas').click(function (e) {
    if (draw.type == 'text' && $('#input').is(':hidden')) {
      $('#input').css({
        'top': e.clientY,
        'left': e.clientX
      }).show().focus();
      $('#input').attr('data-x', draw.startX);
      $('#input').attr('data-y', draw.startY);
    }
    else {
      $('#input').hide();
    }
  });
  $('#input').blur(function () {
    if ($.trim($(this).val()) == '') {
      return;
    }
    var x = +$(this).attr('data-x');
    var y = +$(this).attr('data-y');
    draw.text($(this).val(),x,y);
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
