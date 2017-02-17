/*@const require*/
const version = require('./version');
const cursor = require('./cursor');
const ep = require('./eventproxy');

/*@const global var*/
const global = window;
const doc = document;

/*@const default var*/
const DEFAULT_CONFIG = {
  width: 500, //画布的宽
  height: 375, // 画布的高
  ratio: 1, // 缩放比
  startX: 0, // 开始坐标，内部自动处理
  startY: 0,
  endX: 0, // 截至坐标，内部自动处理
  endY: 0,
  undoMax: 10, // 撤销最大数
  type: 'path', //默认配置
  fontSize: 16, //字号
  strokeWidth: 2, //线宽，最小为2
  stroke: '#222', // 线条颜色
  fillColor: '', // 填充颜色
  isMouseDown: false, //鼠标是否按下的标识
  action: null, // 暂定
  trigger: true, // 是否触发事件  废除
  generateID: function () { // 生成对象id的函数
    return new Date().getTime() + Math.floor(Math.random() * 100);
  },
  wrap: null // 支持一般的查找 当canvas过大导致滚动时，对鼠标的定位需要加上scrollTop和scrollLeft。必须设置，否则溢出时鼠标位置计算出错
}
const ALL_TYPE = {
  'path': 'path',
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
  'allObjects:removed': 'allObjectsRemoved',
  'path:created': 'pathCreated',
  'clear': 'clear'
}
const ALL_FROM = {
  draw: 'draw', // 操作来自_render
  undo: 'undo', // 操作来自undo,redo
  out: 'out' // 操作来自render
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

            if (v === ALL_TYPE.path) {
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
          case 'ratio':
            let width = this.setting.width;
            let height = this.setting.height;
            let backgroundImage = this.canvas.backgroundImage;

            this.canvas.setWidth(width * v);
            this.canvas.setHeight(height * v);

            this.canvas.setZoom(v)
            break;
          case 'generateID':
            if (typeof v !== 'function') {
              this._setting.generateID = function () {
                return new Date().getTime() + Math.floor(Math.random() * 100);
              }
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
    // 设置起点
    let wrap = document.querySelector(this.setting.wrap);
    this.setting = {
      startX: opt.e.clientX - this.canvas._offset.left + wrap.scrollLeft,
      startY: opt.e.clientY - this.canvas._offset.top+ wrap.scrollTop,
      isMouseDown: true
    }
    // 如果是橡皮，则删除
    if (this.setting.type === ALL_TYPE.eraser) {
      opt.target && opt.target.remove();
    }
    // 触发mouse:down 事件
    this.ep.fire(All_EVT['mouse:down'], {
      object: opt.target
    });
  },
  mouseup: function (opt) {
    //设置终点
    let wrap = document.querySelector(this.setting.wrap);
    this.setting = {
      endX: opt.e.clientX - this.canvas._offset.left + wrap.scrollLeft,
      endY: opt.e.clientY - this.canvas._offset.top + wrap.scrollTop,
      isMouseDown: false
    }

    // 绘制
    _render.apply(this);
    //触发 mouse:up 事件
    this.ep.fire(All_EVT['mouse:up'], {
      object: opt.target
    });
  },
  mousemove: function (opt) {
    // 如果不是鼠标点下则返回
    if (!this.setting.isMouseDown) return;
    // 设置终点
    let wrap = document.querySelector(this.setting.wrap);
    //解决出界的效果 暂时屏蔽
    // endX > this.setting.width ? endX = this.setting.width : endX = endX;
    // endY > this.setting.height ? endY = this.setting.height : endY = endY;
    //设置当前参数
    this.setting = {
      endX: opt.e.clientX - this.canvas._offset.left + wrap.scrollLeft,
      endY: opt.e.clientY - this.canvas._offset.top + wrap.scrollTop,
      isMouseDown: true
    }
    // 绘制
    _render.apply(this);
    // 触发 mouse:move事件
    this.ep.fire(All_EVT['mouse:move'], {
      object: opt.target
    });
  },
  mouseover: function () {
    //触发mouse:over事件
    this.ep.fire(All_EVT['mouse:over']);
  },
  mouseout: function () {
    // 触发mouse:out事件
    this.ep.fire('mouse:out');
  },
  pathCreated: function (o) {
    // 因为object:added再mouseup之前，需要再此设置
    /*if (!('id' in o)) {
      o.id = this.setting.generateID();
    }
    if (!('from' in o)) {
      o.from = ALL_FROM.draw;
    }*/
  },
  objectAdded: function (o) {
    // 因为freeDrawing的object:added再mouseup之前，需要再此设置
    if (!('id' in o.target)) {
      o.target.id = this.setting.generateID();
    }
    if (!('from' in o.target)) {
      o.target.from = ALL_FROM.draw;
    }
    // 对象的from属性表示了来自那个操作，某些操作可能不需要触发回调
    if (o.target.from === ALL_FROM.draw) {
      _pushUndo.apply(this, [{
        action: All_EVT['object:added'],
        target: o.target
      }]);
    }
    // 触发回调 回调根据from属性判断来源
    this.ep.fire(All_EVT['object:added'], {
      target: o.target
    });
  },
  objectRemoved: function (o) {
    // 对象的from属性表示了来自那个操作，某些操作可能不需要触发回调
    if (o.target.from === ALL_FROM.draw) {
      _pushUndo.apply(this, [{
        action: All_EVT['object:removed'],
        target: o.target
      }]);
    }
    this.ep.fire(All_EVT['object:removed'], {
      target: o.target
    });
  },
  objectModified: function (o) {
    // 触发回调
    this.ep.fire(All_EVT['object:modified'], {
      target: o.target
    });

  },
  allObjectsRemoved: function (o) {
    // 触发回调
    this.ep.fire(All_EVT['clear'], o);
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
    selection: false,
    //perPixelTargetFind:false 
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
   * @param {Boolean} removeBg
   * 是否删除背景图 默认为false
   */
  fabric.Canvas.prototype.removeAllObjects = function (obj) {

    let objects = this.getObjects().slice();

    try {
      this.fire('allObjects:removed', obj);
    } catch (error) {

    }

    let backgroundImage = this.backgroundImage;

    this.clear();

    if (!obj.removeBg && backgroundImage) {
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
        id: o.id
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
        id: o.id
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
        id: o.id
      })
      break;
    case ALL_TYPE.path:
      return new fabric.Path(o.path, {
        stroke: o.stroke,
        strokeWidth: o.strokeWidth,
        fill: o.fill,
        id: o.id
      })
    default:
      break;
  }
}

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

  // 初始化fabrci
  _initFabric.apply(this);

  // 注册事件监听器  
  _registerEventListener.apply(this);

  // 设置setting的getter和setter  
  _defineSetter.apply(this);

  // 将初始化参数赋值给setting  
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
    if (ALL_TYPE.path === type) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let ctx = this.ctx;
    ctx.strokeStyle = stroke;
    //原生api
    ctx.lineWidth = strokeWidth * setting.ratio;
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
    // 鼠标up，清空上层
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 创建一个空对象
    let object = null;
    //如果是path，对象直接生成，返回这个path
    if (type === ALL_TYPE.path) {
      return this.canvas.getLastItem();
    }
    // 根据缩放比计算坐标点
    let ratio = setting.ratio;
    startX = startX / ratio;
    startY = startY / ratio;
    endX = endX / ratio;
    endY = endY / ratio;

    // 定义绘制对象的通用属性
    let o = {
      type: type,
      stroke: stroke,
      strokeWidth: strokeWidth,
      strokeLineCap: 'round',
      strokeWidth: strokeWidth,
      fillColor: fillColor,
      id: this.setting.generateID()
    }
    // 根据type不同(line || circle  || arc)给o增加属性

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
    //绘制对象，将对象返回
    object = _createObject(o);

    //表明对象来源
    object.from = ALL_FROM.draw;
    // 添加到fabric canvas中
    this.canvas.add(object);

    return object;
  }


}

/**
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



/************** 以下为暴露给实例的方法******************/



/**
 * 
 * 暴露绘制接口
 * @param {Object} o
 *绘制object所需要的参数
 */
function render(opt) {

  let object = _createObject(opt);

  // 表明对象来源为外界（非绘制，非undo）

  if (object) {
    object.from = ALL_FROM.out;
    this.canvas.add(object);
  }
}


/**
 * 撤销操作
 */
function undo() {
  //撤销list为0 返回
  if (this.undoList.length === 0) return;
  //得到当前撤销操作的对象
  let undo = this.undoList[this.undoList.length - 1];
  //如果惭怍没有target 返回，同时pop
  if (!undo.target) return this.undoList.pop();
  //更改对象来源
  undo.target.from = ALL_FROM.undo;
  switch (undo.action) {
    case All_EVT['object:added']:
      undo.target.remove();
      break;
    case All_EVT['object:removed']:
      this.canvas.add(undo.target);
      break;
    case All_EVT['clear']:
      this.canvas.add.apply(this.canvas, [undo.target]);
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
  redo.target.from = ALL_FROM.undo;
  switch (redo.action) {
    case All_EVT['object:added']:
      this.canvas.add(redo.target);
      break;
    case All_EVT['object:removed']:
      redo.target.remove();
      break;
      break;
    default:
      break;
  }
  _pushUndo.apply(this, [this.redoList.pop()]);
}

/**
 * @private
 * 暴露setting接口
 * @param {Object} o
 * o[Object]  => 以对象的方式设置instance
 */
function set(o) {
  this.setting = o;
}

/**
 * 
 * 暴露clear接口
 * @param {Object} o
 * opt.removeBg 是否移除背景图
 * 
 */
function clear(o) {
  let backgroundImage = this.backgroundImage;
  this.undoList.length = 0;
  this.redoList.length = 0;
  this.canvas.removeAllObjects(o);
}

/**
 * 
 * 暴露删除接口
 * @param {Object} opt
 * opt.id 删除对象的id
 */
function remove(opt) {
  let object = this.canvas.getItemById(opt.id);
  if (object) {
    object.from = ALL_FROM.out;
    object.remove();
  }
}

/**
 * @param {String} url
 * 图片url地址
 */
function loadBackgroundImage(url) {
  this.canvas.setBackgroundImage(url, this.canvas.renderAll.bind(wb.canvas), {
    alignX: 'center',
    alignY: 'center',
    width: this.canvas.width,
    height: this.canvas.height
  })
}
/**
 * @param {Number} ratio
 * 缩放比例
 */
function resize(ratio) {
  let width = this.setting.width;
  let height = this.setting.height;
  let backgroundImage = this.canvas.backgroundImage;

  this.canvas.setWidth(width * ratio);
  this.canvas.setHeight(height * ratio);

  this.canvas.getObjects().forEach(function (obj) {
    obj.set({
      width: obj.width * ratio,
      height: obj.height * ratio,
      top: obj.top * ratio,
      left: obj.left * ratio
    })
  })
  this.canvas.renderAll();
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

WhiteBoard.prototype.resize = resize;

WhiteBoard.prototype.loadBackgroundImage = loadBackgroundImage;

WhiteBoard.prototype.ep = new ep();

global.WhiteBoard = WhiteBoard;

module.exports = WhiteBoard;