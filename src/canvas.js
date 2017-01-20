const version = require('./version');
const cursor = require('./cursor');
const ep = require('./eventproxy');
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
const All_EVT = {
  'mouse:down': 'mousedown',
  'mouse:up': 'mouseup',
  'mouse:move': 'mousemove',
  'mouse:over': 'mouseover',
  'mouse:out': 'mouseout',
  'object:added': 'objectAdded',
  'object:modified': 'objectModified',
  'object:removed': 'objectRemoved',
  'objects:removed': 'objectsRemoved'
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
function WhiteBoard(o) {

  this.__setting = DEFAULT_CONFIG;

  this.init(o);

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
 * 初始化时监听的事件
 */
function listener(instance) {
  for (let x in All_EVT) {
    instance.canvas.on(x, function (opt) {
      let handler = eventHandler[All_EVT[x]];
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
  // 增加原型方法 getItemById
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
  //增加原型方法 getLastItem
  fabric.Canvas.prototype.getLastItem = function () {
    let objects = this.getObjects();
    return objects[objects.length - 1];
  };
  //增加原型方法 removeAllObjects

  /**
   * 
   * 
   * @param {any} removeBg
   * 是否删除背景图 默认为false
   */
  fabric.Canvas.prototype.removeAllObjects = function (removeBg) {

    let objects = this.getObjects();
    try {
      this.fire('objects:removed', {
        target: objects
      });
    } catch (error) {

    }

    let bgi = this.backgroundImage;
    this.clear();
    if (!removeBg && bgi) {
      this.setBackgroundImage(bgi, this.renderAll.bind(this));
    }

  };
}

let eventHandler = {
  //所有回调事件都通过各自分发，做进一步管控解耦

  mousedown: function (opt) {
    // `this` is a instance of WhiteBoard ,use apply bind runtime context
    this.setting = {
      startX: opt.e.clientX - this.canvas._offset.left,
      startY: opt.e.clientY - this.canvas._offset.top,
      isMouseDown: true
    }
    if (this.setting.type === ALL_TYPE.eraser) {
      opt.target && opt.target.remove();
    }
    this.ep.fire('mouse:down', {
      object: opt.target
    });
  },
  mouseup: function (opt) {
    this.setting = {
      endX: opt.e.clientX - this.canvas._offset.left,
      endY: opt.e.clientY - this.canvas._offset.top,
      isMouseDown: false
    }
    this.render();

    this.ep.fire('mouse:up', {
      object: opt.target
    });
  },
  mousemove: function (opt) {
    if (!this.setting.isMouseDown) return;
    let endX = opt.e.clientX - this.canvas._offset.left;
    let endY = opt.e.clientY - this.canvas._offset.top;
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
    this.ep.fire('mouse:move', {
      object: opt.target
    });
  },
  mouseover: function () {
    this.ep.fire('mouse:over');
  },
  mouseout: function () {
    this.ep.fire('mouse:out');
  },
  objectAdded: function (o) {
    o.target.id = new Date().getTime() + Math.floor(Math.random() * 10);
    this.ep.fire('object:added', {
      object: o.target
    });
  },
  objectRemoved: function (o) {
    this.ep.fire('object:removed', {
      object: o.target
    });
  },
  objectModified: function (o) {
    this.ep.fire('object:modified', {
      object: o.target
    });
  },
  objectsRemoved: function (o) {
    this.ep.fire('objects:removed', {
      object: o.target
    });
  }
}


/************** 以下为暴露给实例的方法******************/

/**
 * 
 * 实例化一个fabric canvas
 * @returns
 * 
 */
function init(o) {
  //创建fabric canvas
  if (!(o instanceof Object)) return console.error('初始化参数不正确')
  let container = doc.getElementById(o.id);

  if (!container) return console.error('初始化参数不正确');

  this.id = o.id;

  initFabric(this);

  listener(this);

  defineSetter(this);

  for (let k in o) {
    this.setting = o;
  }
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
        ctx.lineTo(startX, endY);
        ctx.lineTo(startX, startY);
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

/**
 * 
 * 暴露setting接口
 * @param {Object} o
 *o[Object]  => 以对象的方式设置instance
 */
function set(o) {
  this.setting = o;
}
//  配置初始化函数

WhiteBoard.prototype.init = init;

WhiteBoard.prototype.version = version;

WhiteBoard.prototype.render = render;

WhiteBoard.prototype.undo = undo;

WhiteBoard.prototype.redo = redo;

WhiteBoard.prototype.set = set;

WhiteBoard.prototype.ep = new ep();

global.WhiteBoard = WhiteBoard;

module.exports = WhiteBoard;