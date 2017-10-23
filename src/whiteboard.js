/*
 * @Author: Liu Jing 
 * @Date: 2017-10-20 11:16:02 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-10-23 14:38:50
 */
/*@const require*/
const version = require('./version');
const cursor = require('./cursor');
const ep = require('./eventproxy');
const polyfill = require('./polyfill');
const Logger = require('./log');

/*@const default var*/
const DEFAULT_CONFIG = {
  width: 500, //canvas width
  height: 375, // canvas height
  ratio: 1, // zoom value
  undoMax: 10, // max undo limit
  type: 'path', // default draw type
  fontSize: 16, // fon size
  strokeWidth: 2, // stroke line width
  stroke: 'red', // stroke line color
  fillColor: '', //  fill color
  allowDrawing: true, // allow drawing
  selectable: false, // object can select, ensure this value is false at this version
  strokeLineCap: 'round', // line cap
  strokeLineJoin: 'round', // line join
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

    if (!(o instanceof Object)) return this.log.error('param error');

    let container = doc.getElementById(o.id);

    if (!container) return this.log.error('can\'t find the element which id is' + o.id);

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
    fabric.Object.prototype.selectable = this._setting.selectable;

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
      case 'stroke':
        this.canvas.freeDrawingBrush.color = value;
        break;
      case 'type':

        this.canvas.isDrawingMode = false;

        this.canvas.hoverCursor = 'default';

        if (value === ALL_TYPE.path && this.allowDrawing === true) {
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
      case 'allowDrawing':
        this.canvas.isDrawingMode = !!value;
        break;
      case 'selectable':
        fabric.Object.prototype.selectable = !!value;
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
      // set start pointer
      let pointer = this.canvas.getPointer(opt.e)
      this.set({
        startX: pointer.x,
        startY: pointer.y,
        isMouseDown: true
      });
      // if eraser, remove object
      if (this.type === ALL_TYPE.eraser && opt.target) {
        opt.target && opt.target.remove();
        opt.target.from = ALL_FROM.draw;
      }
      // fire mouse:down
      this.ep.fire(All_EVT['mouse:down'], {
        object: opt.target
      });
    },
    mouseup: function (opt) {
      //set end point
      let pointer = this.canvas.getPointer(opt.e)
      this.set({
        endX: pointer.x,
        endY: pointer.y,
        isMouseDown: false
      });
      // render current
      this._renderWhenMouseUp();
      //fire mouse:up 
      this.ep.fire(All_EVT['mouse:up'], {
        object: opt.target
      });
    },
    mousemove: function (opt) {
      // if is not mousedown, do nothing
      if (!this.isMouseDown) return;
      // set end point
      let pointer = this.canvas.getPointer(opt.e);
      this.set({
        endX: pointer.x,
        endY: pointer.y
      });
      // render
      this._renderWhenMouseMove();
      // fire mouse:move
      this.ep.fire(All_EVT['mouse:move'], {
        object: opt.target
      });
    },
    mouseover: function () {
      //fire mouse:over
      this.ep.fire(All_EVT['mouse:over']);
    },
    mouseout: function () {
      // fire mouse:out
      this.ep.fire('mouse:out');
    },
    pathCreated: function (o) {
      //TODO:
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
          strokeLineCap: this.storkeLineCap,
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
          strokeLineJoin: this.strokeLineJoin,
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
          strokeLineCap: this.strokeLineCap,
          oCoords: o.oCoords,
          id: o.id
        })
      default:
        break;
    }
  }
  /**
   * render when mouse:move
   * 
   * @memberof WhiteBoard
   */
  _renderWhenMouseMove() {

    if (!this._setting.allowDrawing) return;

    let type = this.type;

    if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type || ALL_TYPE.path === type) return;

    let ratio = this.ratio;
    let startX = this.startX * ratio;
    let startY = this.startY * ratio;
    let endX = this.endX * ratio;
    let endY = this.endY * ratio;
    // if start point and end point is nearly,do nothing
    if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) return;

    let fillColor = this.fillColor;
    let strokeWidth = this.strokeWidth;
    let stroke = this.stroke;
    let isMouseDown = this.isMouseDown;
    let ctx = this.ctx;


    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = stroke;
    //原生api
    ctx.lineWidth = strokeWidth * this.ratio;
    ctx.lineCap = this.storkeLineCap;
    ctx.lineJoin = this.stokeLineJoin;
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
  /**
   * render when mouse:up
   * 
   * @memberof WhiteBoard
   */
  _renderWhenMouseUp() {
    if (!this._setting.allowDrawing) return;

    let type = this.type;

    if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type) return;

    let startX = this.startX;
    let startY = this.startY;
    let endX = this.endX;
    let endY = this.endY;
    //if start pointer and ent pointer nearly , don't add it
    if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) return;

    let fillColor = this.fillColor;
    let strokeWidth = this.strokeWidth;
    let stroke = this.stroke;
    let isMouseDown = this.isMouseDown;
    let ctx = this.ctx;
    let ratio = this.ratio;
    // mouseup _render at lowerCanvasEl with obj
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
      strokeLineCap: this.strokeLineCap,
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
        o.strokeLineJoin = this.strokeLineJoin;
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
    // if list length is 0 ,return 
    if (this.undoList.length === 0) return;
    // get the undo 
    let undo = this.undoList[this.undoList.length - 1];
    // if there is no target ,pop this and return
    if (!undo.target) return this.undoList.pop();
    // change object from prop
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
   * 
   * @param {Object} object
   * fabric object or whit prop id
   * @param {string} object.id
   * fabric object's id
   */
  remove(object) {
    if (typeof object.remove == 'function') {
      object.remove();
    }
    if (object.id) {
      let o = this.canvas.getItemById(object.id);
      if (o) {
        o.from = ALL_FROM.out;
        o.remove();
      }
    }

  }

  /**
   * @param {String} url
   * the url of the background image
   */
  loadBackgroundImage(url) {
    this.canvas.setBackgroundImage(url, this.canvas.renderAll.bind(wb.canvas), {
      alignX: 'center',
      alignY: 'center',
      width: this.originalWidth,
      height: this.originalHeight
    });
  }
  /**
   * @param {Number} ratio
   * resize number
   */
  resize(ratio) {
    return this.set('ratio', ratio);
  }

  ep = new ep();

  log = new Logger(true);

  /**
   * 
   * set debug mode
   * @param {boolean} debugMode 
   * @memberof WhiteBoard
   */
  setDebugMode(debugMode) {
    this.log.setMode(debugMode)
  }

}

global.WhiteBoard = WhiteBoard;

module.exports = WhiteBoard;