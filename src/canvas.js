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
  stroke: '#222',
  fillColor: '',
  isMouseDown: false,
  action: null,
  trigger: true
}
const ALL_TYPE = {
  'pencil': 'pencil',
  'circle': 'circle',
  'rect': 'rect',
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
  'clear': 'clear'
}
const ALL_FROM = {
  draw: 'draw',
  auto: 'auto'
}

/**
 * @private
 * 给实例的setting设置一个setter方法
 */
function _defineSetter() {

  Object.defineProperty(this, 'setting', {

    get: function () {
      return this._setting;
    },

    set: function (o) {

      if (!(o instanceof Object)) return console.error('参数错误');

      for (let k in o) {

        let v = o[k];

        this._setting[k] = v;

        switch (k) {
          case 'width':
            this.canvas.setWidth(v);
            break;
          case 'height':
            this.canvas.setHeight(v);
            break;
          case 'stroke':
            this.canvas.freeDrawingBrush.color = v;
            break;
          case 'type':

            this.canvas.isDrawingMode = false;

            this.canvas.hoverCursor = 'default';

            this.canvas.selectable = false;

            if (v === ALL_TYPE.pencil) {
              this.canvas.isDrawingMode = true;
            }

            if (v === ALL_TYPE.eraser) {
              this.canvas.hoverCursor = cursor.eraser;
            }
            break;
          case 'strokeWidth':

            this.canvas.freeDrawingBrush.width = parseInt(v) > 2 ? parseInt(v) : 2;

            if (parseInt(v) === 1) {
              this._setting.strokeWidth = 2
            }

            break;
          default:
            break;
        }
      }
    }
  });

  this.setting = this._setting;

}

let eventHandler = {

  //所有回调事件都通过各自分发，做进一步管控解耦

  mousedown: function (opt) {
    // `this` is a this of WhiteBoard ,use apply bind runtime context

    this.setting = {
      startX: opt.e.clientX - this.canvas._offset.left,
      startY: opt.e.clientY - this.canvas._offset.top,
      isMouseDown: true
    }

    if (this.setting.type === ALL_TYPE.eraser) {
      opt.target && opt.target.remove();
      _pushUndo.apply(this, [{
        action: All_EVT['object:removed'],
        target: opt.target
      }])
    }
    this.ep.fire(All_EVT['mouse:down'], {
      object: opt.target
    });
  },
  mouseup: function (opt) {

    this.setting = {
      endX: opt.e.clientX - this.canvas._offset.left,
      endY: opt.e.clientY - this.canvas._offset.top,
      isMouseDown: false
    }

    _pushUndo.apply(this, [{
      action: All_EVT['object:added'],
      target: _render.apply(this)
    }])
    this.ep.fire(All_EVT['mouse:up'], {
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
    _render.apply(this);
    this.ep.fire(All_EVT['mouse:move'], {
      object: opt.target
    });
  },
  mouseover: function () {
    this.ep.fire(All_EVT['mouse:over']);
  },
  mouseout: function () {
    this.ep.fire('mouse:out');
  },
  objectAdded: function (o) {
    /*if (!('id' in o.target)) {
      o.target.id = new Date().getTime() + Math.floor(Math.random() * 10);
    }*/
    if (this.setting.trigger) {
      this.ep.fire(All_EVT['object:added'], {
        target: o.target
      });
    }
    else {
      this.setting = {
        trigger: true
      }
    }

  },
  objectRemoved: function (o) {
    if (this.setting.trigger) {
      this.ep.fire(All_EVT['object:removed'], {
        target: o.target
      });
    }
    else {
      this.setting = {
        trigger: true
      };
    }

  },
  objectModified: function (o) {
    if (this.setting.trigger) {
      this.ep.fire(All_EVT['object:modified'], {
        target: o.target
      });
    }
    else {
      this.setting = {
        trigger: true
      };
    }
  },
  clear: function (o) {
    if (!this.setting.trigger) return;
    this.ep.fire(All_EVT['clear'], {
      target: o.target
    });
    this.setting = {
      trigger: true
    };
  }
}
/**
 * 初始化时注册监听事件
 */
function _registerEventListener() {

  let self = this;

  for (let x in All_EVT) {
    this.canvas.on(x, function (opt) {
      let handler = eventHandler[All_EVT[x]];
      if (!handler) return;
      handler.apply(self, [opt]);
    });
  }
}

/**
 * 
 * 初始化fabric
 */
function _initFabric() {

  let id = this.id;

  delete this.id;

  this.canvas = new fabric.Canvas(id, {
    selection: false
  });

  fabric.Object.prototype.selectable = false;

  this.ctx = this.canvas.upperCanvasEl.getContext('2d');

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
      this.fire(All_EVT['clear'], {
        target: objects
      });
    } catch (error) {

    }

    let backgroundImage = this.backgroundImage;

    this.clear();

    if (!removeBg && backgroundImage) {
      this.setBackgroundImage(backgroundImage, this.renderAll.bind(this));
    }

  };
}

/**
 * 
 * 创建fabric对象的方法
 * @param {Object} o
 * 创建时必须的属性
 */
function _createObject(o) {
  switch (o.type) {
    case ALL_TYPE.line:
      return new fabric.Line([o.x1, o.y1, o.x2, o.y2], {
        stroke: o.stroke,
        strokeWidth: o.strokeWidth,
        radius: 90,
        strokeLineCap: 'round',
        id: o.id ? o.id : new Date().getTime() + Math.floor(Math.random() * 10)
      })
      break;
    case ALL_TYPE.circle:
      return new fabric.Circle({
        top: o.top,
        left: o.left,
        radius: o.radius,
        stroke: o.stroke,
        strokeWidth: o.strokeWidth,
        fill: o.fillColor,
        id: o.id ? o.id : new Date().getTime() + Math.floor(Math.random() * 10)
      })
      break;
    case ALL_TYPE.rect:
      return new fabric.Rect({
        width: o.width,
        height: o.height,
        top: o.top,
        left: o.left,
        stroke: o.stroke,
        strokeLineJoin: 'round',
        strokeWidth: o.strokeWidth,
        fill: o.fillColor,
        id: o.id ? o.id : new Date().getTime() + Math.floor(Math.random() * 10)
      })
      break;
    default:
      break;
  }
}
/************** 以下为暴露给实例的方法******************/

/**
 * 
 * 实例化一个fabric canvas
 * @returns
 * 
 */
function _init(o) {
  //创建fabric canvas
  if (!(o instanceof Object)) return console.error('初始化参数不正确')
  let container = doc.getElementById(o.id);

  if (!container) return console.error('初始化参数不正确');

  this.id = o.id;

  _initFabric.apply(this);

  _registerEventListener.apply(this);

  _defineSetter.apply(this);

  for (let k in o) {
    this.setting = o;
  }
}

/**
 *@private
 * 绘制成对象渲染
 */
function _render() {
  let setting = this.setting;
  let type = setting.type;
  if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type) return;
  let startX = setting.startX;
  let startY = setting.startY;
  let endX = setting.endX;
  let endY = setting.endY;
  //这里做个判断，如果起点与终点均过于小则不添加
  if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) return;

  let fillColor = setting.fillColor;
  let strokeWidth = setting.strokeWidth;
  let stroke = setting.stroke;
  let isMouseDown = this.setting.isMouseDown;
  // mousemove _render at upperCanvasEl with temp 
  if (isMouseDown) {
    if (ALL_TYPE.pencil === type) return;
    this.ctx.clearRect(0, 0, setting.width, setting.height);
    let ctx = this.ctx;
    ctx.strokeStyle = stroke;
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
      case ALL_TYPE.rect:
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

  // mouseup _render at lowerCanvasEl with obj
  else {
    this.ctx.clearRect(0, 0, setting.width, setting.height);
    let object;
    if (type === ALL_TYPE.pencil) {
      this.canvas.getLastItem().id = new Date().getTime() + Math.floor(Math.random() * 10);
      return this.canvas.getLastItem();
    }
    let o = {
      type: type,
      stroke: stroke,
      strokeWidth: strokeWidth,
      strokeLineCap: 'round',
      strokeWidth: strokeWidth,
      fillColor: fillColor,
      id: new Date().getTime() + Math.floor(Math.random() * 10)
    }
    switch (type) {
      case ALL_TYPE.line:
        o.x1 = startX - strokeWidth / 2;
        o.y1 = startY - strokeWidth / 2;
        o.x2 = endX - strokeWidth / 2;
        o.y2 = endY - strokeWidth / 2;
        break;
      case ALL_TYPE.circle:
        let radius = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
        o.top = startY - radius - strokeWidth / 2;
        o.left = startX - radius - strokeWidth / 2;
        o.radius = radius;
        break;
      case ALL_TYPE.rect:
        o.width = Math.abs(endX - startX);
        o.height = Math.abs(endY - startY);
        o.top = startY <= endY ? startY - strokeWidth / 2 : endY - strokeWidth / 2;
        o.left = startX <= endX ? startX - strokeWidth / 2 : endX - strokeWidth / 2;
        o.strokeLineJoin = 'round';
        o.strokeWidth = strokeWidth;
        break;
      default:
        break;
    }
    object = _createObject(o);
    this.canvas.add(object);

    return object;
  }


}

/**
 * 
 * 暴露绘制接口
 * @param {Object} o
 *绘制object所需要的参数
 */
function render(opt) {
  this.setting.trigger = opt.trigger === undefined ? true : opt.trigger;
  delete opt.trigger;
  let object = _createObject(opt);
  if (object) {
    this.canvas.add(object);
  }
}

/**
 * 
 * 需要的时候向撤销操作中追加动作
 * @param {Obejct} o
 * undo对象
 */
function _pushUndo(o) {
  if (this.undoList.length >= this.setting.undoMax) {
    this.undoList.shift();
  }
  this.undoList.push(o);
}
/**
 * 撤销操作
 */
function undo() {
  if (this.undoList.length === 0) return;
  let undo = this.undoList[this.undoList.length - 1];
  if (!undo.target) return this.undoList.pop();
  switch (undo.action) {
    case All_EVT['object:added']:
      undo.target.remove();
      break;
    case All_EVT['object:removed']:
      this.canvas.add(undo.target);
      break;
    case All_EVT['clear']:
      this.canvas.add.apply(this.canvas, (undo.target));
      break;
    default:
      break;
  }
  this.redoList.push(this.undoList.pop())
}

/**
 * 恢复操作
 */
function redo() {
  if (this.redoList.length === 0) return;
  let redo = this.redoList[this.redoList.length - 1];
  switch (redo.action) {
    case All_EVT['object:added']:
      this.canvas.add(redo.target);
      break;
    case All_EVT['object:removed']:
      redo.target.remove();
      break;
    case All_EVT['clear']:
      this.canvas.removeAllObjects(redo.removeBg);
      break;
    default:
      break;
  }
  _pushUndo.apply(this, [this.redoList.pop()])
}

/**
 * @private
 * 暴露setting接口
 * @param {Object} o
 *o[Object]  => 以对象的方式设置instance
 */
function set(o) {
  this.setting = o;
}

/**
 * 
 * 暴露clear接口
 * @param {Object} opt
 * opt.removeBg 是否移除背景图
 * opt.trigger  是否触发clear事件
 */
function clear(opt) {
  opt === undefined && (opt = {});
  let objects = this.canvas.getObjects().slice();
  let backgroundImage = this.backgroundImage;
  _pushUndo.apply(this, [{
    action: All_EVT['clear'],
    target: objects,
    removeBg: opt.removeBg
  }]);
  this.canvas.removeAllObjects(opt.removeBg);
  this.setting.trigger = opt.trigger === undefined ? true : opt.trigger;
}

/**
 * 
 * 暴露删除接口
 * @param {Object} opt
 * opt.id 删除对象的id
 * opt.trigger 是否触发事件
 */
function remove(opt) {
  let object = this.canvas.getItemById(opt.id);
  if (object) {
    this._setting.trigger = opt.trigger === undefined ? true : opt.trigger;
    object.remove();
  }
}
/**
 * 
 * @param {Object} o
 *{
    id: =>初始化fabric元素的id,
    undoMax: => 撤销操作的最大值 || 10
    fontSize => 文本字体大小 || 16px
    strokeWidth => 线条宽度 || 1px
    stroke => 线条颜色 || #222
    fillColor => 填充颜色 || rgba(0,0,0,0)
  }
 */
function WhiteBoard(o) {

  this._setting = DEFAULT_CONFIG;

  this.undoList = [];

  this.redoList = [];

  _init.apply(this, [o]);

}

WhiteBoard.prototype.render = render;

WhiteBoard.prototype.remove = remove;

WhiteBoard.prototype.version = version;

WhiteBoard.prototype.undo = undo;

WhiteBoard.prototype.redo = redo;

WhiteBoard.prototype.set = set;

WhiteBoard.prototype.clear = clear;

WhiteBoard.prototype.ep = new ep();

global.WhiteBoard = WhiteBoard;

module.exports = WhiteBoard;