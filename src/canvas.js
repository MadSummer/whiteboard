const version = require('./version');
const cursor = require('./cursor');
const global = window;
const doc = document;
const DEFAULT_CONFIG = {
  width: 500,
  height: 375,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  undoMax: 10,
  type: 'pencil',
  fontSize: 16,
  strokeWidth: 2,
  strokeColor: '#222',
  fillColor: '',
  isMouseDown: false,
  action: null
}
const ALL_TYPE = {
  'pencil': 'pencil',
  'circle': 'circle',
  'square': 'square',
  'line': 'line',
  'eraser': 'eraser',
  'clear': 'clear',
}
const Allevt = {
  'mouse:down': 'mousedown',
  'mouse:up': 'mouseup',
  'mouse:move': 'mousemove',
  'mouse:over': 'mouseover',
  'mouse:out': 'mouseout',
  'object:added': 'objectAdded',
  'object:modified': 'objectModified',
  'object:removed': 'objectRemoved',
}
/**
 * 
 * @param {Object} o
 *{
    id: =>初始化fabric元素的id,
    undoMax: => 撤销操作的最大值 || 10
    fontSize => 文本字体大小 || 16px
    strokeWidth => 线条宽度 || 1px
    strokeColor => 线条颜色 || #222
    fillColor => 填充颜色 || rgba(0,0,0,0)
  }
 */
function Draw(o) {
  if (!o instanceof Object) return console.error('参数不正确');
  let instance = this;
  instance.id = o.id;
  instance.__setting = DEFAULT_CONFIG;
}

/**
 * 
 * 实例化一个fabric canvas
 * @returns
 * 
 */
function init() {
  //创建fabric canvas
  if (!check(this.id)) return console.error('参数配置有误');
  initFabric(this);
  listener(this);
  defineSetter(this)
}

/**
 * 
 * 给实例的setting设置一个setter方法
 * @param {any} instance
 * fabric实例
 */
function defineSetter(instance) {
  Object.defineProperty(instance, 'setting', {
    get: function () {
      return instance.__setting;
    },
    set: function (o) {
      if (!o instanceof Object) return console.error('参数错误');
      for (let k in o) {
        let v = o[k];
        instance.__setting[k] = v;
        switch (k) {
          case 'width':
            instance.canvas.setWidth(v);
            break;
          case 'height':
            instance.canvas.setHeight(v);
            break;
          case 'strokeColor':
            instance.canvas.freeDrawingBrush.color = v;
            break;
          case 'type':
            instance.canvas.isDrawingMode = false;
            instance.canvas.hoverCursor = 'default';
            instance.canvas.selectable = false;
            if (ALL_TYPE.pencil === v) { 
              instance.canvas.isDrawingMode = true;
            }
            if (ALL_TYPE.eraser === v) {
              instance.canvas.hoverCursor = cursor.eraser;
            }
            break;
          case 'strokeWidth':
            instance.canvas.freeDrawingBrush.width = parseInt(v) > 2 ? parseInt(v) : 2;
            if (parseInt(v) === 1) {
              instance.__setting.strokeWidth = 2
            }
            break;
          default:
            break;
        }
      }
    }
  });
  instance.setting = instance.__setting;
}
/**
 * 
 * 检查传入的参数是否正确（是否为对象，是否找得到对应的元素）
 * @returns
 */
function check(id) {
  if (!id) return console.error('初始化参数不正确');
  let container = doc.getElementById(id);
  return container === null ? false : true;
}

/**
 * 初始化时监听的事件
 */
function listener(instance) {
  for (let x in Allevt) {
    instance.canvas.on(x, function (opt) {
      let handler = eventHandler[Allevt[x]];
      if (!handler) return;
      handler.apply(instance, [opt]);
    });
  }
}

/**
 * 
 * 初始化fabric
 */
function initFabric(instance) {
  let id = instance.id;
  delete instance.id;
  instance.canvas = new fabric.Canvas(id, {
    selection: false
  });
  fabric.Object.prototype.selectable = false;
  instance.ctx = instance.canvas.upperCanvasEl.getContext('2d');
  // 增加原型方法
  fabric.Canvas.prototype.getItemById = function (id) {
    let object = null;
    let objects = this.getObjects();
    for (let i = 0; i < this.size(); i++) {
      if (objects[i]['id'] && objects[i]['id'] === id) {
        object = objects[i];
        break;
      }
    }
    return object;
  };
  //增加原型方法
  fabric.Canvas.prototype.getLastItem = function () {
    let objects = this.getObjects();
    return objects[objects.length - 1];
  };
}

/**
 * 绘制成对象渲染
 */
function render(o) {
  let setting = this.setting;
  let type = setting.type;
  if (ALL_TYPE[type] === undefined || ALL_TYPE.pencil === type || ALL_TYPE.eraser === type) return;
  let startX = setting.startX;
  let startY = setting.startY;
  let endX = setting.endX;
  let endY = setting.endY;
  //这里做个判断，如果起点与终点均过于小则不添加
  if (Math.abs(startX - endX) < 1 && Math.abs(startY - endY) < 1) return;

  let fillColor = setting.fillColor;
  let strokeWidth = setting.strokeWidth;
  let strokeColor = setting.strokeColor;

  let isMouseDown = this.setting.isMouseDown;
  this.ctx.clearRect(0, 0, setting.width, setting.height);
  // mousemove render at upperCanvasEl with temp 
  if (isMouseDown) {
    let ctx = this.ctx;
    ctx.strokeStyle = strokeColor;
    //原生api
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    switch (type) {
      case ALL_TYPE.line:
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        break;
      case ALL_TYPE.circle:
        let radius = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        break;
      case ALL_TYPE.square:
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(startX,endY);
        ctx.lineTo(startX,startY);
      default:
        break;
    }
    ctx.stroke();
  }
  // mouseup render at lowerCanvasEl with obj
  else {
    let createObject = {
      line: () => {
        return new fabric.Line([startX - strokeWidth / 2, startY - strokeWidth / 2, endX - strokeWidth / 2, endY - strokeWidth / 2], {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          radius: 90,
          strokeLineCap: 'round',
          id: new Date().getTime()
        })
      },
      circle: () => {
        let radius = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
        return new fabric.Circle({
          top: startY - radius - strokeWidth / 2,
          left: startX - radius - strokeWidth / 2,
          radius: radius,
          fill: '',
          stroke: strokeColor,
          strokeWidth: strokeWidth
        })
      },
      square: () => {
        return new fabric.Rect({
          width: Math.abs(endX - startX),
          height: Math.abs(endY - startY),
          top: startY <= endY ? startY - strokeWidth / 2 : endY - strokeWidth / 2,
          left: startX <= endX ? startX - strokeWidth / 2 : endX - strokeWidth / 2,
          fill: '',
          stroke: strokeColor,
          strokeLineJoin: 'round',
          strokeWidth: strokeWidth,
        })
      }
    }
    this.canvas.add(o === undefined ? createObject[type]() : o);
  }
}

let eventHandler = {
  mousedown: function (opt) {
    // `this` is a instance of Draw ,use apply bind runtime context
    this.setting = {
      startX: opt.e.clientX - draw.canvas._offset.left,
      startY: opt.e.clientY - draw.canvas._offset.top,
      isMouseDown: true
    }
    if (this.setting.type === ALL_TYPE.eraser) {
      opt.target && opt.target.remove();
    }
  },
  mouseup: function (opt) {
    this.setting = {
      endX: opt.e.clientX - draw.canvas._offset.left,
      endY: opt.e.clientY - draw.canvas._offset.top,
      isMouseDown: false
    }
    this.render();
  },
  mousemove: function (opt) {
    if (!this.setting.isMouseDown) return;
    let endX = opt.e.clientX - draw.canvas._offset.left;
    let endY = opt.e.clientY - draw.canvas._offset.top;
    //解决出界的效果
    // 如果是圆呢？
    // endX > this.setting.width ? endX = this.setting.width : endX = endX;
    // endY > this.setting.height ? endY = this.setting.height : endY = endY;
    this.setting = {
      endX: endX,
      endY: endY,
      isMouseDown: true
    }
    this.render();
  },
  mouseover: function () {

  },
  mouseout: function () {

  },
  objectAdded: function (o) {
    o.target.id = new Date().getTime() + Math.floor(Math.random() * 10);
    console.log(o.target.id, 'Is Added');
  },
  objectRemoved: function (o) {
    console.log(o.target.id, 'Is Removed');
  },
  objectModified: function (o) {
    console.log(o.target.id, 'Is Modified')
  }
}

/**
 * 清空canvas
 */
function clear() {
  this.canvas.clear();
}

/**
 * 撤销操作
 */
function undo() {

}

/**
 * 恢复操作
 */
function redo() {

}
//  配置初始化函数
Draw.prototype.init = init;

Draw.prototype.version = version;

Draw.prototype.render = render;

Draw.prototype.clear = clear;

Draw.prototype.undo = undo;

Draw.prototype.redo = redo;

global.Draw = Draw;

module.exports = Draw;