
/**
 * @Author Liu Jing 
 * @Date: 2017-10-20 11:16:02 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-11-08 12:23:15
 */
/**
 * @memberof WhiteBoard
 */
const version = require('./version');
const cursor = require('./cursor');
const ep = require('./eventproxy');
const polyfill = require('./polyfill');
const Logger = require('./log');
const DEFAULT_CONFIG = {
  width: 500, //canvas width
  height: 375, // canvas height
  ratio: 1, // zoom value
  undoMax: 10, // max undo limit
  type: 'path', // default draw type
  fontSize: 24, // font size
  fontFamily: 'Microsoft Yahei',
  fontWeight: 'normal',
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
const ALL_TYPE = {
  'path': 'path',
  'circle': 'circle',
  'rect': 'rect',
  'line': 'line',
  'eraser': 'eraser',
  'clear': 'clear',
  'text': 'text'
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
/**
 * @type {Window}
 */
const global = window;
/**
 * @type {Document}
 */
const doc = document;

class WhiteBoard {
  /**
   * Creates an instance of WhiteBoard.
   * @param {Object} o 
   * init param obejct
   * @param {string} o.id
   * container element id
   * @param {number} [o.undoMax=10]
   * the max limit of undo
   * @param {number} [o.fontSize=24]
   * the font size
   * @param {number} [o.strokeWidth=2]
   * the stoke width
   * @param {string} [o.fillColor=red]
   * the fill color
   * @param {number} [o.maxSize=4096]
   * canvas max width or height
   * @param {number} [o.width=500]
   * canvas width
   * @param {number} [o.height=300]
   * canvas height
   * @param {number} [o.ratio=1]
   * canvas zoom ratio
   * @param {string} [o.type=path]
   * whiteboard type
   * @param {string} [o.fontFamily=Microsoft Yahei]
   * fontFamily
   * @param {string} [o.fontWeight=normal]
   * fontWeight
   * @param {string} [o.stroke=red]
   * stroke color
   * @param {boolean} [o.allowDrawing=true]
   * allow drawing
   * @param {string} [o.strokeLineCap=round]
   * strokeLineCap
   * @param {string} [o.strokeLineJoin=round]
   * strokeLineJoin
   * @param {string} o.backgroundImage
   * backgroundImage
   * @param {function} [o.generateID=function () {return new Date().getTime() + Math.floor(Math.random() * 100);}]
   *  object id generate function
   */

  constructor(o) {
    /* polyfill for some browser */
    polyfill();
    this._setting = Object.assign(DEFAULT_CONFIG, o);
    this.undoList = [];
    this.redoList = [];
    this._init(o);
  }
  /**
   * @private
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

    // getter and setter  
    this._defineSetter();
  }
  /**
   * 
   * add textarea element
   * @private
   * @param {Element} el 
   *  continer
   */
  _appendTextarea(el) {
    let self = this;
    let textarea = doc.createElement('textarea');
    self._textarea = textarea;
    textarea.style.display = 'none';
    textarea.style.position = 'absolute';
    textarea.style.left = 0;
    textarea.style.top = 0;
    textarea.addEventListener('blur', function (e) {
      e.stopPropagation();
      if (self.type !== ALL_TYPE.text) return this.style.display = 'none';
      let text = this.value.trim();
      if (!text) return this.style.display = 'none';
      let object = self._createObject({
        type: ALL_TYPE.text,
        left: parseFloat(this.style.left) / self.ratio,
        top: parseFloat(this.style.top) / self.ratio,
        fill: self.fillColor || self.stroke,
        stroke: self.stroke,
        strokeWidth: self.strokeWidth,
        fontSize: self.fontSize,
        fontFamily: self.fontFamily,
        fontWeight: self.fontWeight,
        text: text,
        id: self.generateID()
      });
      self.canvas.add(object);
      this.value = '';
      this.style.display = 'none';
    });
    textarea.addEventListener('mousedown', function (e) {
      e.stopPropagation();
    }, false);
    textarea.addEventListener('mouseup', function (e) {
      e.stopPropagation();
    }, false);
    textarea.addEventListener('mousemove', function (e) {
      e.stopPropagation();
    }, false);
    el.appendChild(textarea);
  }

  /**
   * Create an instance of fabric
   * @private
   */
  _initFabric() {

    let id = this._setting.id;

    let self = this;

    this.canvas = new fabric.Canvas(id, {
      selection: false
      //perPixelTargetFind:false 
    });

    this._appendTextarea(this.canvas.wrapperEl);

    fabric.Object.prototype.selectable = this._setting.selectable;
    /**
     * 
     * return the key prop of the fabric object
     * @returns  {Object}
     */
    fabric.Object.prototype.exportKeyAttr = function () {
      var data = {
        stroke: this.stroke,
        fill: this.fill,
        strokeWidth: this.strokeWidth,
        id: this.id,
        type: this.type,
        from: this.from
      }
      switch (this.type) {
        case ALL_TYPE.line:
          data.x1 = this.x1;
          data.x2 = this.x2;
          data.y1 = this.y1;
          data.y2 = this.y2;
          break;
        case ALL_TYPE.circle:
          data.top = this.top;
          data.left = this.left;
          data.radius = this.radius;
          break;
        case ALL_TYPE.rect:
          data.width = this.width;
          data.height = this.height;
          data.top = this.top;
          data.left = this.left;
          break;
        case ALL_TYPE.path:
          data.path = this.path.join(' ').replace(/,/g, ' ');
          data.height = this.height;
          data.top = this.top;
          data.left = this.left;
          break;
        case ALL_TYPE.text:
          data.text = this.text;
          data.height = this.height;
          data.top = this.top;
          data.left = this.left;
          data.fontFamily = this.fontFamily;
          data.fontSize = this.fontSize;
          data.fontWeight = this.fontWeight;
          break;
        default:
          break;
      }
      return data;
    }

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
     * @returns {Object}
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
      this.fire('allObjects:removed', obj);
      let backgroundImage = this.backgroundImage;
      this.clear();
      if (obj && !obj.removeBg && backgroundImage) {
        this.setBackgroundImage(backgroundImage, this.renderAll.bind(this));
      }
    };
  }
  /**
   * 
   * define instance's prop setter and getter
   * @private
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
   * @private
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
        // reset
        this.canvas.isDrawingMode = false;
        this.canvas.hoverCursor = 'default';
        this.canvas.defaultCursor = 'default';
        // if path and allowDrawing,open isDrawingMode
        if (value === ALL_TYPE.path && this.allowDrawing === true) {
          this.canvas.isDrawingMode = true;
        }
        // if  is eraser, set hover cursor
        if (value === ALL_TYPE.eraser) {
          this.canvas.hoverCursor = cursor.eraser;
        }
        // if is not text, disappear the textarea element
        if (value !== ALL_TYPE.text) this._textarea.style.display = 'none';
        // if is text , set default cursor as text
        if (value === ALL_TYPE.text) this.canvas.defaultCursor = 'text';
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
        this.canvas.isDrawingMode = (!!value && this.type === ALL_TYPE.path);
        break;
      case 'selectable':
        fabric.Object.prototype.selectable = !!value;
        break;
      case 'backgroundImage':
        this.loadBackgroundImage(value);
        break;
      default:
        break;
    }
    return true;
  }
  /**
   * @memberof WhiteBoard
   */
  eventHandler = {
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#mouse:down
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    mousedown: function (opt) {
      if (opt.e.button === 2) return;
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
      // if text
      if (this.type === ALL_TYPE.text) {
        if (this._textarea.style.display === 'block') return;
        this._textarea.style.display = 'block';
        this.setTextareaPosition();
        var self = this;
        setTimeout(function () {
          self._textarea.focus();
        }, 0);
      }
      /**
       * @event mousedown
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['mouse:down'], {
        object: opt.target
      });
    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#mouse:up
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    mouseup: function (opt) {
      if (opt.e.button === 2) return;
      //set end point
      let pointer = this.canvas.getPointer(opt.e)
      this.set({
        endX: pointer.x,
        endY: pointer.y,
        isMouseDown: false
      });
      // render current
      this._renderWhenMouseUp();
      /**
       * @event mouseup
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['mouse:up'], {
        object: opt.target
      });
    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#mouse:move
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
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
      /**
       * @event mousemove
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['mouse:move'], {
        object: opt.target
      });
    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#mouse:over
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    mouseover: function () {
      /**
       * @event mouseover
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['mouse:over']);
    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#mouse:out
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    mouseout: function () {
      /**
       * @event mouseout
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire('mouse:out');
    },
    pathCreated: function (o) {
      //TODO:
    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#object:added
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
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
      /**
       * @event objectAdded
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['object:added'], {
        target: o.target
      });
    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#object:removed
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    objectRemoved: function (o) {
      if (o.target.from === ALL_FROM.draw) {
        this._pushUndo({
          action: All_EVT['object:removed'],
          target: o.target
        });
      }
      /**
       * @event objectRemoved
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['object:removed'], {
        target: o.target
      });
    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#object:midfied
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    objectModified: function (o) {
      /**
       * @event objectModified
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['object:modified'], {
        target: o.target
      });

    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#object:allObjects:removed
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    allObjectsRemoved: function (o) {
      /**
       * clear the canvas
       * @event clear
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['clear'], o);
    }
  }
  /**
   * @private
   * register events handler
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
   * create a fabric object instance
   * @private
   * @param {Object} o 
   * @param {string} o.type
   * type
   * @param {string} o.stroke
   * stroke color
   * @param {string} o.strokeWidth
   * strokeWidth
   * @param {number} o.left
   * offset left
   * @param {number} o.top
   * offset top
   * @returns {fabric.Object}
   */
  _createObject(o) {
    switch (o.type) {
      case ALL_TYPE.line:
        return new fabric.Line([o.x1, o.y1, o.x2, o.y2], {
          stroke: o.stroke,
          strokeWidth: o.strokeWidth,
          radius: 90,
          strokeLineCap: o.storkeLineCap,
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
          strokeLineJoin: o.storkeLineCap,
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
          strokeLineCap: o.storkeLineCap,
          id: o.id
        })
        break;
      case ALL_TYPE.text:
        return new fabric.Text(o.text, {
          stroke: o.stroke,
          strokeWidth: o.strokeWidth,
          fill: o.fill,
          strokeLineCap: o.storkeLineCap,
          id: o.id,
          left: o.left,
          top: o.top,
          fontFamily: o.fontFamily,
          fontSize: o.fontSize,
          fontWeight: o.fontWeight
        })
      default:
        break;
    }
  }
  /**
   * 
   * render when mousemove
   * @private
   * @returns {undefined}
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
   * @private
   * @return {undefined | fabric.Object}
   */
  _renderWhenMouseUp() {
    if (!this._setting.allowDrawing) return;
    let type = this.type;
    if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type || ALL_TYPE.text === type) return;
    let startX = this.startX;
    let startY = this.startY;
    let endX = this.endX;
    let endY = this.endY;
    //if start pointer and ent pointer nearly , don't add it
    if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) return;
    let fillColor = this.fillColor;
    let strokeWidth = this.strokeWidth;
    let stroke = this.stroke;
    let strokeLineCap = this.strokeLineCap;
    let isMouseDown = this.isMouseDown;
    let ctx = this.ctx;
    let ratio = this.ratio;
    // mouseup _render at lowerCanvasEl with obj
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let object = null;
    if (type === ALL_TYPE.path) {
      return this.canvas.getLastItem();
    }
    let o = {
      type: type,
      stroke: stroke,
      strokeWidth: strokeWidth,
      strokeLineCap: strokeLineCap,
      strokeWidth: strokeWidth,
      fillColor: fillColor,
      id: this.generateID()
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
        o.strokeLineJoin = this.strokeLineJoin;
        o.strokeWidth = strokeWidth;
        break;
      default:
        break;
    }
    object = this._createObject(o);
    object.from = ALL_FROM.draw;
    this.canvas.add(object);
    return object;
  }
  /**
   * push history to undoList
   * @private
   * @param {Obejct} o
   * undo history
   */
  _pushUndo(o) {
    if (this.undoList.length >= this.sundoMax) {
      this.undoList.shift();
    }
    this.undoList.push(o);
  }
  /**
   * 
   * undo
   * @returns {undefined}
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
   * 
   * redo
   * @returns {undefined}
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
   * export render interface
   * @param {Object} o
   * the object 
   */
  render(opt) {
    let object = this._createObject(opt);
    if (object) {
      object.from = ALL_FROM.out;
      this.canvas.add(object);
    }
  }
  /**
   * export setting interface
   * @param {Object} o
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
   * clear the canvas instance
   * @param {object} o
   * @param {boolean} o.removeBg
   * remove the backgroundImage
   * 
   */
  clear(o) {
    let backgroundImage = this.backgroundImage;
    this.undoList.length = 0;
    this.redoList.length = 0;
    this.canvas.removeAllObjects(o);
  }
  /**
   * remove fabric object
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
   * @param {string} url
   * the url of the background image
   */
  loadBackgroundImage(url) {
    this.canvas.setBackgroundImage(url, this.canvas.renderAll.bind(this.canvas), {
      alignX: 'center',
      alignY: 'center',
      width: this.originalWidth,
      height: this.originalHeight
    });
  }
  /**
   * resize the canvas and all fabrci.Obejct
   * @param {number} ratio 
   * resize number
   * @returns {boolean}
   * means set success or faild
   */
  resize(ratio) {
    return this.set('ratio', ratio);
  }
  /**
   * 
   * set textarea position
   * @param {number} [left=this.startX * this.ratio]
   * offset left
   * @param {number} [top=(this.startY - this.fontSize / 2) * this.ratio]
   * offset top
   */
  setTextareaPosition(left, top) {
    this._textarea.style.left = this.startX * this.ratio + 'px';
    this._textarea.style.top = (this.startY - this.fontSize / 2) * this.ratio + 'px';
  }
  /**
   * event proxy
   * @see EventProxy
   */
  ep = new ep();
  /**
   * logger factory
   * @see Logger
   */
  log = new Logger(true);

  /**
   * 
   * set debug mode
   * @param {boolean} debugMode 
   */
  setDebugMode(debugMode) {
    this.log.setMode(debugMode)
  }
  /**
   * clear all fabrci.Obejct and backgroundImage 
   * @param {Object} obj 
   * new setting param
   */
  reset(obj) {
    this.clear({
      removeBg: true
    });
    if (obj instanceof Object) {
      this.originalHeight = obj.height;
      this.originalWidth = obj.width;
      this.set(obj);
    }
  }
  destory() {
    //clear objects
    this.clear({ removeBg: true });
    var wrapperEl = this.canvas.wrapperEl;
    var upperCanvasEl = this.canvas.upperCanvasEl;
    var lowerCanvasEl = this.canvas.lowerCanvasEl;
    // reset canvas style and class
    lowerCanvasEl.setAttribute('style', '');
    lowerCanvasEl.classList.remove('lower-canvas');
    // remove upperCanvasEl
    wrapperEl.removeChild(upperCanvasEl);
    // remove lowerCanvasEl
    wrapperEl.removeChild(lowerCanvasEl);
    // add lowerCanvasEl 
    if (wrapperEl.parentNode) {
      wrapperEl.parentNode.insertBefore(lowerCanvasEl, wrapperEl.nextSibling);
    }
    // remove wrapperEl
    wrapperEl.parentNode.removeChild(wrapperEl);
  }
}
WhiteBoard.version = version;
global.WhiteBoard = WhiteBoard;
module.exports = WhiteBoard;