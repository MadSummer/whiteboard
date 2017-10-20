/*
 * @Author: Liu Jing 
 * @Date: 2017-10-20 11:16:02 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-10-20 18:11:42
 */
/*@const require*/
const version = require('./version');
const cursor = require('./cursor');
const ep = require('./eventproxy');
const polyfill = require('./polyfill');

/*@const default var*/
const DEFAULT_CONFIG = {
  width: 500, //canvas width
  height: 375, // canvas height
  ratio: 1, // zoom value
  undoMax: 10, // max undo limit
  type: 'path', // default draw type
  fontSize: 16, // fon size
  strokeWidth: 2, // stroke line width
  strokeColor: 'red', // stroke line color
  fillColor: '', //  fill color
  generateID: function () { // generate the id of object
    return new Date().getTime() + Math.floor(Math.random() * 100);
  },
  maxSize: 4096 //the max width or max height of the canvas element @see https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
}

const global = window;
const doc = document;

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
  draw: 'draw', // object from _render
  undo: 'undo', // object from undo,redo
  out: 'out' // object from render
}
/* polyfill for some browser */
polyfill();
class WhiteBoard {
  /**
   * Creates an instance of WhiteBoard.
   * @param {object} o 
   * @memberof WhiteBoard
   */
  constructor(o) {

    this._setting = Object.assign(DEFAULT_CONFIG, o);

    this.undoList = [];

    this.redoList = [];

    this._init(o);

  }
  /**  
   * @param {Object} o
   * @param {string} o.id
   * container element id
   * @param {number} o.undoMax
   * the max limit of undo
   * @param {number} o.fontSize
   * the font size
   * @param {number} o.strokeWidth
   * the stoke width
   * @param {string} o.fillColor
   * the fill color
   * @memberof WhiteBoard
   */
  _init(o) {

    if (!(o instanceof Object)) return console.error('param error');

    let container = doc.getElementById(o.id);

    if (!container) return console.error('can\'t find the element which id is' + o.id);

    this.originalWidth = o.width;

    this.originalHeight = o.height;


    // init fabrci
    this._initFabric();

    // register event handler  
    this._registerEventListener();

    // 设置setting的getter和setter  
    this._defineSetter();

  }

  /**
   * 
   * Create an instance of fabric
   * @memberof WhiteBoard
   */
  _initFabric() {

    let id = this._setting.id;

    let self = this;

    this.canvas = new fabric.Canvas(id, {
      selection: false
      //perPixelTargetFind:false 
    });

    //fabric.Object.prototype.selectable = false;

    this.ctx = this.canvas.upperCanvasEl.getContext('2d');

    /**
     * 
     * @param {string} id
     * the object's id
     * @returns
     * fabric object or null
     */
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

    /**
     * get the last item object
     * 
     * @returns 
     */
    fabric.Canvas.prototype.getLastItem = function () {

      let objects = this.getObjects();

      return objects[objects.length - 1];

    };
    /**
     * 
     * @param {object} obj
     * @param {boolean} obj.removeBg
     * 是否删除背景图
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
   * define setter and getter
   * @memberof WhiteBoard
   */
  _defineSetter() {
    for (let prop in this._setting) {
      if (this._setting.hasOwnProperty(prop)) {
        let value = this._setting[prop];
        Object.defineProperty(this, prop, {
          get: () => {
            return this._setting[prop];
          },
          set: value => {
            if (this._propChangeCallback(prop, value)) {
              this._setting[prop] = value;
            }
          }
        });
        this[prop] = value;
      }
    }
  }
  /**
   * 
   * 
   * @param {string} prop
   * prop
   * @param {string | function} value
   * @memberof WhiteBoard
   */
  _propChangeCallback(prop, value) {
    switch (prop) {
      case 'width':
        if (value > this._setting.maxSize) return false;
        this.canvas.setWidth(value);
        break;
      case 'height':
        if (value > this._setting.maxSize) return false;
        this.canvas.setHeight(value);
        break;
      case 'strokeColor':
        this.canvas.freeDrawingBrush.color = value;
        break;
      case 'type':

        this.canvas.isDrawingMode = false;

        this.canvas.hoverCursor = 'default';

        this.canvas.selectable = false;

        if (value === ALL_TYPE.path) {
          this.canvas.isDrawingMode = true;
        }

        if (value === ALL_TYPE.eraser) {
          this.canvas.hoverCursor = cursor.eraser;
        }
        break;
      case 'strokeWidth':

        this.canvas.freeDrawingBrush.width = parseInt(value) > 2 ? parseInt(value) : 2;

        if (parseInt(value) === 1) {
          this._setting.strokeWidth = 2
        }

        break;
      case 'ratio':
        let maxSize = this._setting.maxSize;
        if (this.originalWidth * value > maxSize || this.originalHeight * value > maxSize) return false;
        this.width = this.originalWidth * value;
        this.height = this.originalHeight * value;
        this.canvas.setZoom(value);
        break;
      case 'generateID':
        if (typeof value === 'function') {
          this._setting.generateID = value;
        } else {
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  }
  eventHandler = {

    //all event callback

    mousedown: function (opt) {
      // `this` is a instance of WhiteBoard ,use apply bind runtime context
      // 设置起点
      let wrap = document.querySelector(this.wrap);
      let pointer = this.canvas.getPointer(opt.e)
      this.set({
        startX: pointer.x,
        startY: pointer.y,
        isMouseDown: true
      });
      // 如果是橡皮，则删除
      if (this.type === ALL_TYPE.eraser) {
        opt.target && opt.target.remove();
      }
      // 触发mouse:down 事件
      this.ep.fire(All_EVT['mouse:down'], {
        object: opt.target
      });
    },
    mouseup: function (opt) {
      //设置终点
      let wrap = document.querySelector(this.wrap);

      let pointer = this.canvas.getPointer(opt.e)

      this.set({
        endX: pointer.x,
        endY: pointer.y,
        isMouseDown: false
      });

      // 绘制
      this._render();
      //触发 mouse:up 事件
      this.ep.fire(All_EVT['mouse:up'], {
        object: opt.target
      });
    },
    mousemove: function (opt) {
      // 如果不是鼠标点下则返回
      if (!this.isMouseDown) return;
      // 设置终点
      let wrap = document.querySelector(this.wrap);
      //解决出界的效果 暂时屏蔽
      // endX > this.width ? endX = this.width : endX = endX;
      // endY > this.height ? endY = this.height : endY = endY;
      //设置当前参数
      let pointer = this.canvas.getPointer(opt.e);
      this.set({
        endX: pointer.x,
        endY: pointer.y
      });
      // 绘制
      this._render();
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
        o.id = this.generateID();
      }
      if (!('from' in o)) {
        o.from = ALL_FROM.draw;
      }*/
    },
    objectAdded: function (o) {
      // 因为freeDrawing的object:added再mouseup之前，需要再此设置
      if (!('id' in o.target)) {
        o.target.id = this.generateID();
      }
      if (!('from' in o.target)) {
        o.target.from = ALL_FROM.draw;
      }
      // 对象的from属性表示了来自那个操作，某些操作可能不需要触发回调
      if (o.target.from === ALL_FROM.draw) {
        this._pushUndo({
          action: All_EVT['object:added'],
          target: o.target
        });
      }
      // 触发回调 回调根据from属性判断来源
      this.ep.fire(All_EVT['object:added'], {
        target: o.target
      });
    },
    objectRemoved: function (o) {
      // 对象的from属性表示了来自那个操作，某些操作可能不需要触发回调
      if (o.target.from === ALL_FROM.draw) {
        this._pushUndo({
          action: All_EVT['object:removed'],
          target: o.target
        });
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
   * 
   * 
   * @memberof WhiteBoard
   */
  _registerEventListener() {
    for (let x in All_EVT) {
      this.canvas.on(x, opt => {
        let handler = this.eventHandler[All_EVT[x]];
        if (!handler) return;
        handler.apply(this, [opt]);
      });
    }
  }
  /**
   * 
   * 
   * @param {object} o 
   * @returns 
   * @memberof WhiteBoard
   */
  _createObject(o) {
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
          strokeLineCap: 'round',
          oCoords: o.oCoords,
          id: o.id
        })
      default:
        break;
    }
  }
  /**
   * @private
   * 绘制成对象渲染
   */
  _render() {
    let type = this.type;
    if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type) return;
    let startX = this.startX;
    let startY = this.startY;
    let endX = this.endX;
    let endY = this.endY;
    //这里做个判断，如果起点与终点均过于小则不添加
    if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) return;

    let fillColor = this.fillColor;
    let strokeWidth = this.strokeWidth;
    let stroke = this.stroke;
    let isMouseDown = this.isMouseDown;
    let ctx = this.ctx;
    let ratio = this.ratio;
    // mousemove _render at upperCanvasEl with temp 
    if (isMouseDown) {
      if (ALL_TYPE.path === type) return;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.strokeStyle = stroke;
      //原生api
      ctx.lineWidth = strokeWidth * this.ratio;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      switch (type) {
        case ALL_TYPE.line:
          ctx.moveTo(startX * ratio, startY * ratio);
          ctx.lineTo(endX * ratio, endY * ratio);
          break;
        case ALL_TYPE.circle:
          let radius = Math.sqrt(Math.pow(startX * ratio - endX * ratio, 2) + Math.pow(startY * ratio - endY * ratio, 2));
          ctx.arc(startX * ratio, startY * ratio, radius, 0, 2 * Math.PI);
          break;
        case ALL_TYPE.rect:
          ctx.moveTo(startX * ratio, startY * ratio);
          ctx.lineTo(endX * ratio, startY * ratio);
          ctx.lineTo(endX * ratio, endY * ratio);
          ctx.lineTo(startX * ratio, endY * ratio);
          ctx.lineTo(startX * ratio, startY * ratio);
        default:
          break;
      }
      ctx.stroke();
    }

    // mouseup _render at lowerCanvasEl with obj
    else {
      // 鼠标up，清空上层
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // 创建一个空对象
      let object = null;
      //如果是path，对象直接生成，返回这个path
      if (type === ALL_TYPE.path) {
        return this.canvas.getLastItem();
      }
      // 定义绘制对象的通用属性
      let o = {
        type: type,
        stroke: stroke,
        strokeWidth: strokeWidth,
        strokeLineCap: 'round',
        strokeWidth: strokeWidth,
        fillColor: fillColor,
        id: this.generateID()
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
      object = this._createObject(o);

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
  _pushUndo(o) {
    if (this.undoList.length >= this.sundoMax) {
      this.undoList.shift();
    }
    this.undoList.push(o);
  }
  /**
   * 撤销操作
   */
  undo() {
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
  redo() {
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
    this._pushUndo(this.redoList.pop());
  }
  /**
   * 
   * 暴露绘制接口
   * @param {Object} o
   *绘制object所需要的参数
   */
  render(opt) {

    let object = this._createObject(opt);

    //    let ratio = 

    // 表明对象来源为外界（非绘制，非undo）

    if (object) {
      object.from = ALL_FROM.out;
      this.canvas.add(object);
    }
  }
  /**
   * 暴露setting接口
   * @param {object} o
   * seting object
   * @return {boolean}
   * Indicates whether the settings are successful
   */
  set(o) {
    let flag = true;
    if (arguments.length == 2) {
      this[arguments[0]] = arguments[1];
      if (this[arguments[0]] !== arguments[1]) {
        flag = false
      }
    } else {
      for (let prop in o) {
        if (o.hasOwnProperty(prop)) {
          let value = o[prop];
          this[prop] = value;
          if (this[prop] !== value) {
            flag = false
          }
        }
      }
    }
    return flag;
  }

  /**
   * 
   * 暴露clear接口
   * @param {Object} o
   * opt.removeBg 是否移除背景图
   * 
   */
  clear(o) {
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
  remove(opt) {
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
  loadBackgroundImage(url) {
    this.canvas.setBackgroundImage(url, this.canvas.renderAll.bind(wb.canvas), {
      alignX: 'center',
      alignY: 'center',
      width: this.originalWidth,
      height: this.originalHeight
    })
  }
  /**
   * @param {Number} ratio
   * 缩放比例
   */
  resize(ratio) {
    return this.set('ratio', ratio);
  }

  ep = new ep();

}

global.WhiteBoard = WhiteBoard;

module.exports = WhiteBoard;