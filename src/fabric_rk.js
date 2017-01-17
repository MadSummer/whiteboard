;
(function (window, undefined) {
  var doc = document;
  var body = document.body;
  var draw = {
    // 当前显示的画布
    canvas: null, 
    // 实际绘制的画布
    ctx: null, 
    // 绘制颜色
    color: '#000',
    // 绘制线宽
    lineWidth: 1,
    // 绘制阴影
    shadowBlur: 0,
    // fontSize
    fontSize: 16,
    idNumber: 0,
    // 起点位置
    startX: 0,
    startY: 0,
    // 终点位置
    endX: 0,
    endY: 0,
    // 圆的半径
    radius: 0,
    // 绘制类型
    type: 'pencil',
    pencilPoints: [],
    // 鼠标按下
    isMouseDown: false,
    // 鼠标移动
    isMouseMove: false,
    // 鼠标是否点击一个绘制对象
    hasTarget: false,
    // undo 列表
    undoArr: [],
    // redo 列表
    redoArr: [],
    //cursor
    cursor: {
      eraser: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAUCAYAAAB1aeb6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKTWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/sl0p8zAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAJBSURBVHjapNbfS1NhGAfwx7ZGG/4LA3nw4mi70KsIYhfzkBFhsUnh1sXpRgbOXdVyCw2PrcYp6EJzwXLbRe8bk0kXEbimEHihNTxZFCOQsU1Jha6Hnay3izSa6HZ+HHjhnPd9v3zgfXne97QwxkDv82Kod1ycX29XNKUs0H5hbD33ZOBui158MdITHcyU2wDAqyNOe6V87oQeeOnR5UhAPwwAACbryd+a8ULCFxyMfz6tGIAtTkmZvGh/rgmvLET6bsdWzhiBAQVKpy8NAQCY1Wa25BnHneHMtYoh2E3jyfBot9VcU41/W820xUL3w8uKAdjipFIy9vC83VQ66Gq67DvVxdapUCT6umwABqQCnX7psZvW/u9tir8KByYzhmALdUrJpdFua/bwSEM8H+6JPlhRLEbgrltzH1Me+9OjRo/F30p9keCsoVqmKNDSnL9TOm7CkSfch+T1gDe6fFbRh3r3azldTHluNJzJGKtrpTcjV1yIBJEnorx79fB4oyaL/AQiMuRFItd+2JrNr/vYWUs6fBwSRI4I2apfC1xIeIMcIkH+JslVf6KazL+XjfcUh10H8IYmePXZwF+YE0i2utelNgeMMdgq51tHXEgQkfCiPKEFrt+mWr+WLDDGYMbHpRCRcUI2pSW8WUjo3ibGGMDXWb+AiAR5kcm1XZva4HZlYX+1OOKOfwlphRljYD5lM+8BAEApDf2OdELHJdWwlhve6Y/Ju08dm/nOfPH79i+Nv0Md7qni/L1z43rPvz8DAIWvfrkisI81AAAAAElFTkSuQmCC'
    },
    // 初始化
    init: function (id) {
      var whiteboard = doc.getElementById(id);
      if (!whiteboard) return console.log('not find canvas');
      this.canvas = new fabric.Canvas(id, {
        perPixelTargetFind: false,
        selection: false
      });
      fabric.Object.prototype.selectable = true;
      // 扩展object的id属性
      fabric.Canvas.prototype.getItemById = function (id) {
        var object = null,
          objects = this.getObjects();
        for (var i = 0; i < this.size(); i++) {
          console.log(objects[i]['id'])
          if (objects[i]['id'] && objects[i]['id'] === id) {
            object = objects[i];
            break;
          }
        }
        return object;
      };
      this.ctx = this.canvas.upperCanvasEl.getContext('2d');
    },
    // 终止涂鸦
    stopFreeDraw: function () {
      this.canvas.isDrawingMode = false;
    },
    // 开启涂鸦
    startFreeDraw: function () {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush.color = this.color;
      this.canvas.freeDrawingBrush.width = this.lineWidth;
      this.canvas.freeDrawingBrush.shadowBlur = this.shadowBlur;
    },
    // smooth draw
    /*pencilRender: function(points) {
      var ctx = draw.ctx;
      v = draw.canvas.viewportTransform,
      p1 = points[0],
      p2 = points[1];
      ctx.save();
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      ctx.beginPath();

      //if we only have 2 points in the path and they are the same
      //it means that the user only clicked the canvas without moving the mouse
      //then we should be drawing a dot. A path isn't drawn between two identical dots
      //that's why we set them apart a bit
      if (points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
        p1.x -= 0.5;
        p2.x += 0.5;
      }
      ctx.moveTo(p1.x, p1.y);

      function lerp (p1,p2, t) {
        if (typeof t === 'undefined') {
          t = 0.5;
        }
        t = Math.max(Math.min(1, t), 0);
        return new fabric.Point(p1.x + (p2.x - p1.x) * t, p1.y + (p2.y - p1.y) * t);
      }
      for (var i = 1, len = points.length; i < len; i++) {
        // we pick the point between pi + 1 & pi + 2 as the
        // end point and p1 as our control point.
        var midPoint = lerp(p1,p2);
        ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);

        p1 = points[i];
        p2 = points[i + 1];
      }
      // Draw last line as a straight line while
      // we wait for the next point to be able to calculate
      // the bezier control point
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.restore();
    },*/
    // mousedown 事件
    mousedown: function (options) {
      if (draw.type == 'eraser') {
        if (options.target != null || options.target != undefined) {
          options.target.remove();
        }
      }
      draw.isMouseDown = true;
      draw.startX = options.e.clientX - draw.canvas._offset.left;
      draw.startY = options.e.clientY - draw.canvas._offset.top;
      if (draw.type == 'pencil') {
        draw.pencilPoints.push(new fabric.Point(draw.startX * 2, draw.startY * 2));
        return;
      }
      var ctx = draw.ctx;
      ctx.clearRect(0, 0, draw.canvas.width, draw.canvas.height);
      ctx.moveTo(draw.startX, draw.startY);
      ctx.fillStyle = draw.color;
      ctx.strokeStyle = draw.color;
      ctx.lineWidth = draw.lineWidth;
    },
    convertPointsToSVGPath: function (points) {
      var path = [],
        p1 = new fabric.Point(points[0].x, points[0].y),
        p2 = new fabric.Point(points[1].x, points[1].y);

      path.push('M ', points[0].x, ' ', points[0].y, ' ');
      for (var i = 1, len = points.length; i < len; i++) {
        var midPoint = p1.midPointFrom(p2);
        // p1 is our bezier control point
        // midpoint is our endpoint
        // start point is p(i-1) value.
        path.push('Q ', p1.x, ' ', p1.y, ' ', midPoint.x, ' ', midPoint.y, ' ');
        p1 = new fabric.Point(points[i].x, points[i].y);
        if ((i + 1) < points.length) {
          p2 = new fabric.Point(points[i + 1].x, points[i + 1].y);
        }
      }
      path.push('L ', p1.x, ' ', p1.y, ' ');
      return path;
    },
    // mousemove 事件
    mousemove: function (options) {
      if (!draw.isMouseDown) return;
      draw.isMouseDown = true;
      draw.isMouseMove = true;
      draw.endX = options.e.clientX - draw.canvas._offset.left;
      draw.endY = options.e.clientY - draw.canvas._offset.top;
      var ctx = draw.ctx;
      if (draw.type == 'pencil') {
        draw.pencilPoints.push(new fabric.Point(draw.endX * 2, draw.endY * 2));
        return;
      }
      ctx.beginPath();
      ctx.clearRect(0, 0, draw.canvas.width, draw.canvas.height);
      ctx.fillStyle = draw.color;
      ctx.strokeStyle = draw.color;
      ctx.lineWidth = draw.lineWidth;
      switch (draw.type) {
        case 'line':
          ctx.moveTo(draw.startX, draw.startY);
          ctx.lineTo(draw.endX, draw.endY);
          break;
        case 'circle':
          draw.radius = Math.sqrt((draw.endX - draw.startX) * (draw.endX - draw.startX) + (draw.endY - draw.startY) * (draw.endY - draw.startY));
          ctx.arc(draw.startX, draw.startY, draw.radius, 0, 2 * Math.PI);
          break;
        case 'square':
          ctx.moveTo(draw.startX, draw.startY);
          ctx.lineTo(draw.endX, draw.startY);
          ctx.lineTo(draw.endX, draw.endY);
          ctx.lineTo(draw.startX, draw.endY);
          ctx.lineTo(draw.startX, draw.startY);
        default:
          break;
      }
      ctx.stroke();
    },
    // mouseup 事件
    mouseup: function (options) {
      draw.isMouseDown = false;
      draw.isMouseMove = false;
      var ctx = draw.ctx;
      ctx.beginPath();
      ctx.clearRect(0, 0, draw.canvas.width, draw.canvas.height);
      switch (draw.type) {
        case 'pencil':
          var pathData = draw.convertPointsToSVGPath(draw.pencilPoints).join('');
          draw.pencilPoints = [];
          var path = new fabric.Path(pathData, {
            fill: null,
            stroke: draw.color,
            strokeWidth: draw.lineWidth,
          });
          draw.canvas.add(path);
          path.setCoords();
          draw.canvas.renderAll();
          break;
        case 'line':
          var line = new fabric.Line([draw.startX - draw.lineWidth / 2, draw.startY - draw.lineWidth / 2, draw.endX - draw.lineWidth / 2, draw.endY - draw.lineWidth / 2], {
            stroke: draw.color,
            strokeWidth: draw.lineWidth,
            radius: 90
          })
          draw.canvas.add(line)
          sync({
            type: 'add',
            obj: line
          })
          break;
        case 'circle':
          var circle = new fabric.Circle({
            top: draw.startY - draw.radius - draw.lineWidth / 2,
            left: draw.startX - draw.radius - draw.lineWidth / 2,
            radius: draw.radius,
            fill: '',
            stroke: draw.color,
            strokeWidth: draw.lineWidth
          })
          draw.canvas.add(circle);
          sync({
            type: 'add',
            obj: circle
          })
          break;
        case 'square':
          var square = new fabric.Rect({
            width: Math.abs(draw.endX - draw.startX),
            height: Math.abs(draw.endY - draw.startY),
            top: draw.startY <= draw.endY ? draw.startY - draw.lineWidth / 2 : draw.endY - draw.lineWidth / 2,
            left: draw.startX <= draw.endX ? draw.startX - draw.lineWidth / 2 : draw.endX - draw.lineWidth / 2,
            fill: '',
            stroke: draw.color,
            strokeWidth: draw.lineWidth,
          })
          draw.canvas.add(square);
          sync({
            type: 'add',
            obj: square
          });
          break;
        default:
          break;
      }
      ctx.clearRect(0, 0, draw.canvas.width, draw.canvas.height);
    },
    undo: function () {
      if (this.undoArr.length == 0) return;
      var undo = this.undoArr.pop();
      if (undo.type == 'add') {
        undo.obj.remove();
      }
      if (undo.type == 'remove') {
        this.canvas.add(undo.obj);
      }
      this.redoArr.push(undo);
    },
    redo: function () {
      if (this.redoArr.length == 0) return;
      var redo = this.redoArr.pop();
      if (redo.type == 'add') {
        draw.canvas.add(redo.obj);
      }
      if (redo.type == 'remove') {
        redo.obj.remove();
      }
    },
    eraser: function () {
      draw.type = 'eraser';
      fabric.Object.prototype.hoverCursor = 'url(' + draw.cursor.eraser + '),auto';
    },
    clear: function () {
      this.canvas.clear();
    },
    // 增加 修改 删除对象时需要将操作放再undoArr中
    addObject: function (e) {
      draw.undoArr.push({
        type: 'add',
        obj: e.target,
      });
    },
    modifiedObject: function (e) {
      // pause
    },
    removeObject: function (e) {
      // 如果时选中手动删除时，才把操作添加到撤销数组
      if (draw.undoArr.length < 1) return;
      if (draw.undoArr[draw.undoArr.length - 1].type != 'select') return;
      draw.undoArr.pop();
      draw.undoArr.push({
        type: 'remove',
        obj: e.target,
      });
    },
    selectObject: function () {
      draw.undoArr.push({
        type: 'select',
      });
    },
    text: function (text, x, y) {
      var txt = new fabric.Text(text, {
        left: x,
        top: y
      })
      draw.canvas.add(txt);
      sync({
        type: 'add',
        obj: txt
      })
    },
    draw: function (opt) {
      /*opt = {
          type:,  // 笔画类型(pencil||line||circle||square||eraser||text||clear)
          id:,    // 笔画id
          data:   // 笔画数据
        }*/
      switch (opt.type) {
        case 'pencil':
          var objs = draw.canvas.getObjects();
          var pencil = objs[objs.length - 1];
          sync({
            type: 'add',
            obj: pencil
          })
          break;
        case 'line':
          var line = new fabric.Line([draw.startX - draw.lineWidth / 2, draw.startY - draw.lineWidth / 2, draw.endX - draw.lineWidth / 2, draw.endY - draw.lineWidth / 2], {
            stroke: draw.color,
            strokeWidth: draw.lineWidth,
            radius: 90
          })
          draw.canvas.add(line)
          sync({
            type: 'add',
            obj: line
          })
          break;
        case 'circle':
          var circle = new fabric.Circle({
            top: draw.startY - draw.radius - draw.lineWidth / 2,
            left: draw.startX - draw.radius - draw.lineWidth / 2,
            radius: draw.radius,
            fill: '',
            stroke: draw.color,
            strokeWidth: draw.lineWidth
          })
          draw.canvas.add(circle);
          sync({
            type: 'add',
            obj: circle
          })
          break;
        case 'square':
          var square = new fabric.Rect({
            width: Math.abs(draw.endX - draw.startX),
            height: Math.abs(draw.endY - draw.startY),
            top: draw.startY <= draw.endY ? draw.startY - draw.lineWidth / 2 : draw.endY - draw.lineWidth / 2,
            left: draw.startX <= draw.endX ? draw.startX - draw.lineWidth / 2 : draw.endX - draw.lineWidth / 2,
            fill: '',
            stroke: draw.color,
            strokeWidth: draw.lineWidth,
          })
          draw.canvas.add(square);
          sync({
            type: 'add',
            obj: square
          });
          break;
        default:
          break;
      }
    }
  }
  return window.draw = draw;
})(window, undefined);