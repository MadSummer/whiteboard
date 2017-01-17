//draw.init('canvas', 'whiteboard');
var draw
$(document).ready(function () {
  var width = parseInt($('#whiteboard').css('width'));
  var height = parseInt($('#whiteboard').css('height')) || 600;
  $('#whiteboard').attr('width', width);
  $('#whiteboard').attr('height', height);
  draw = new Draw({ id: 'whiteboard' });
  draw.init();
  // 颜色选择器
  $('.fa-circle').colpick({
    flat: false,
    layout: 'hex',
    submit: 0,
    showEvent: 'mouseover',
    onChange: function (hsb, hex, rgb, el, bySetColor) {
      draw.color = '#' + hex;
      $('.fa-circle').css('color', draw.color);
    }
  });
  $('.fa-circle').colpickHide();
  $('.colpick ').mouseleave(function (ev) {
    $('.fa-circle').colpickHide(ev);
    return false;
  })
  // 注册事件
  $('#drawController').on('click', function (e) {
    var type = $(e.target).attr('data-type');
    var opt = $(e.target).attr('data-opt');
    $('#drawController i').removeClass('active');
    $(e.target).addClass('active');
    fabric.Object.prototype.selectable = false;
    draw.canvas.perPixelTargetFind = true;
    if (type) {
      draw.type = type;
    }
    if (type == 'pencil') {
      draw.startFreeDraw();
    }
    if (opt) {
      fabric.Object.prototype.selectable = true;
      draw.canvas.perPixelTargetFind = false;
    }
    switch (opt) {
      case 'select':
        draw.type = 'select';
        sync({
          type: 'select'
        })
        break;
      case 'clear':
        draw.clear();
        sync({
          type:'clear'
        })
        break;
      case 'undo':
        draw.undo();
        sync({
          type: 'undo'
        });
        break;
      case 'redo':
        draw.redo();
        sync({
          type: 'redo'
        });
        break;
      case 'size':
        draw.lineWidth = parseInt($(e.target).text());
        if (draw.type == 'pencil') {
          draw.startFreeDraw();
        }
        break;
      case 'eraser':
        sync({
          type: 'eraser',
          index: draw.canvas.getObjects().indexOf(draw.canvas.getActiveObject())
        });
        draw.eraser();
        break;
      default:
        break;
    }
  });
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
  var socket = io.connect('http://192.168.1.38:6666');
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
