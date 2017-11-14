/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "E:\\node\\whiteboard\\app\\dist\\";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @Author Liu Jing 
 * @Date: 2017-10-20 11:16:02 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-11-14 14:15:59
 */
/**
 * @memberof WhiteBoard
 */
var version = __webpack_require__(2);
var cursor = __webpack_require__(3);
var ep = __webpack_require__(4);
var polyfill = __webpack_require__(5);
var Logger = __webpack_require__(6);
var DEFAULT_CONFIG = {
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
  selectable: false, // object can select, ensure this value is false at this version
  strokeLineCap: 'round', // line cap
  strokeLineJoin: 'round', // line join
  allowTouchScrolling: true, // Indicates whether the browser can be scrolled when using a touchscreen and dragging on the canvas
  generateID: function generateID() {
    // generate the id of object
    return new Date().getTime() + Math.floor(Math.random() * 100);
  },
  maxObjects: 200, // canvas max objects
  cursor: cursor,
  maxSize: 4096 //the max width or max height of the canvas element @see https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
};
var ALL_TYPE = {
  'path': 'path',
  'circle': 'circle',
  'rect': 'rect',
  'line': 'line',
  'eraser': 'eraser',
  'clear': 'clear',
  'text': 'text',
  'disabled': 'disabled'
};
var All_EVT = {
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
  'clear': 'clear',
  'destory': 'destory',
  'textarea:input': 'textareaInput',
  'textarea:focus': 'textareaFocus'
};
var ALL_FROM = {
  draw: 'draw', // object from _render
  undo: 'undo', // object from undo,redo
  out: 'out' // object from render

  /**
   * @type {Window}
   */
};var global = window;
/**
 * @type {Document}
 */
var doc = document;

var WhiteBoard = function () {
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
   * @param {string} [o.strokeLineCap=round]
   * strokeLineCap
   * @param {string} [o.strokeLineJoin=round]
   * strokeLineJoin
   * @param {string} o.backgroundImage
   * backgroundImage
   * @param {function} [o.generateID=function () {return new Date().getTime() + Math.floor(Math.random() * 100);}]
   *  object id generate function
   */

  function WhiteBoard(o) {
    _classCallCheck(this, WhiteBoard);

    _initialiseProps.call(this);

    /* polyfill for some browser */
    polyfill();
    this._setting = Object.assign({}, DEFAULT_CONFIG, o);
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


  _createClass(WhiteBoard, [{
    key: '_init',
    value: function _init(o) {

      if (!(o instanceof Object)) return this.log.error('param error');

      var container = doc.getElementById(o.id);

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

  }, {
    key: '_appendTextarea',
    value: function _appendTextarea(el) {
      var self = this;
      var textarea = doc.createElement('textarea');
      self._textarea = textarea;
      textarea.style.display = 'none';
      textarea.style.position = 'absolute';
      textarea.style.left = 0;
      textarea.style.top = 0;
      textarea.style.color = this.stroke;
      textarea.addEventListener('focus', function (e) {
        e.stopPropagation();
        self.ep.fire(All_EVT['textarea:focus'], {
          target: this
        });
      });
      textarea.addEventListener('blur', function (e) {
        e.stopPropagation();
        if (self.type !== ALL_TYPE.text || self.getObjects().length >= self.maxObjects) {
          this.value = '';
          this.style.display = 'none';
          return;
        }
        var text = this.value.trim();
        if (!text) return this.style.display = 'none';
        var object = self._createObject({
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
      textarea.addEventListener('input', function (e) {
        e.stopPropagation();
        self.ep.fire(All_EVT['textarea:input'], {
          target: this
        });
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

  }, {
    key: '_initFabric',
    value: function _initFabric() {

      var id = this._setting.id;

      var self = this;

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
          fill: this.fill || '',
          strokeWidth: this.strokeWidth,
          id: this.id,
          type: this.type,
          from: this.from
        };
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
      };

      this.ctx = this.canvas.upperCanvasEl.getContext('2d');

      /**
       * 
       * @param {string} id
       * the object's id
       * @returns
       * fabric object or null
       */
      fabric.Canvas.prototype.getObjectById = function (id) {
        var object = null;
        var objects = this.getObjects();
        for (var i = 0; i < this.size(); i++) {
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
      fabric.Canvas.prototype.getLastObject = function () {

        var objects = this.getObjects();

        return objects[objects.length - 1];
      };
      /**
       * 
       * @param {object} obj
       * @param {boolean} obj.removeBg
       * removeBg
       * @param {boolean} obj.notFire
       * fire evt ?
       */
      fabric.Canvas.prototype.removeAllObjects = function (obj) {
        var objects = this.getObjects().slice();
        if (!obj || !obj.notFire) {
          this.fire('allObjects:removed', obj);
        }
        var backgroundImage = this.backgroundImage;
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

  }, {
    key: '_defineSetter',
    value: function _defineSetter() {
      var _this = this;

      var _loop = function _loop(prop) {
        if (_this._setting.hasOwnProperty(prop)) {
          var value = _this._setting[prop];
          if (value == undefined || value == null) {
            _this._setting[prop] = DEFAULT_CONFIG[prop];
            value = _this._setting[prop];
          }
          Object.defineProperty(_this, prop, {
            get: function get() {
              return _this._setting[prop];
            },
            set: function set(value) {
              if (_this._propChangeCallback(prop, value)) {
                _this._setting[prop] = value;
              }
            }
          });
        }
      };

      for (var prop in this._setting) {
        _loop(prop);
      }
      for (var prop in this._setting) {
        if (this._setting.hasOwnProperty(prop)) {
          this[prop] = this._setting[prop];
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

  }, {
    key: '_propChangeCallback',
    value: function _propChangeCallback(prop, value) {
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
          // if path open isDrawingMode
          if (value === ALL_TYPE.path) {
            this.canvas.isDrawingMode = true;
          }
          // change cursor
          this._changeCursorByType(value);
          // if is not text, disappear the textarea element
          if (value !== ALL_TYPE.text) this._textarea.style.display = 'none';
          break;
        case 'strokeWidth':
          this.canvas.freeDrawingBrush.width = parseInt(value) > 2 ? parseInt(value) : 2;
          if (parseInt(value) === 1) {
            this._setting.strokeWidth = 2;
          }
          break;
        case 'ratio':
          var maxSize = this._setting.maxSize;
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
        case 'allowTouchScrolling':
          this.canvas.allowTouchScrolling = !!value;
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

  }, {
    key: '_registerEventListener',

    /**
     * @private
     * register events handler
     */
    value: function _registerEventListener() {
      var _this2 = this;

      var _loop2 = function _loop2(x) {
        _this2.canvas.on(x, function (opt) {
          var handler = _this2.eventHandler[All_EVT[x]];
          if (!handler) return;
          handler.apply(_this2, [opt]);
        });
      };

      for (var x in All_EVT) {
        _loop2(x);
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

  }, {
    key: '_createObject',
    value: function _createObject(o) {
      switch (o.type) {
        case ALL_TYPE.line:
          return new fabric.Line([+o.x1, +o.y1, +o.x2, +o.y2], {
            stroke: o.stroke,
            strokeWidth: +o.strokeWidth,
            radius: 90,
            strokeLineCap: o.storkeLineCap,
            id: o.id
          });
          break;
        case ALL_TYPE.circle:
          return new fabric.Circle({
            top: +o.top,
            left: +o.left,
            radius: +o.radius,
            stroke: o.stroke,
            strokeWidth: +o.strokeWidth,
            fill: o.fillColor,
            id: o.id
          });
          break;
        case ALL_TYPE.rect:
          return new fabric.Rect({
            width: +o.width,
            height: +o.height,
            top: +o.top,
            left: +o.left,
            stroke: o.stroke,
            strokeLineJoin: o.storkeLineCap,
            strokeWidth: +o.strokeWidth,
            fill: o.fillColor,
            id: o.id
          });
          break;
        case ALL_TYPE.path:
          return new fabric.Path(o.path, {
            stroke: o.stroke,
            strokeWidth: +o.strokeWidth,
            fill: o.fill,
            strokeLineCap: o.storkeLineCap,
            id: o.id
          });
          break;
        case ALL_TYPE.text:
          return new fabric.Text(o.text, {
            stroke: o.stroke,
            strokeWidth: +o.strokeWidth,
            fill: o.fill,
            strokeLineCap: o.storkeLineCap,
            id: o.id,
            left: +o.left,
            top: +o.top,
            fontFamily: o.fontFamily,
            fontSize: +o.fontSize,
            fontWeight: o.fontWeight
          });
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

  }, {
    key: '_renderWhenMouseMove',
    value: function _renderWhenMouseMove() {
      var type = this.type;
      if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type || ALL_TYPE.path === type || ALL_TYPE.disabled === type || this.getObjects().length >= this.maxObjects) return;
      var ratio = this.ratio;
      var startX = this.startX * ratio;
      var startY = this.startY * ratio;
      var endX = this.endX * ratio;
      var endY = this.endY * ratio;
      // if start point and end point is nearly,do nothing
      if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) return;
      var fillColor = this.fillColor;
      var strokeWidth = this.strokeWidth;
      var stroke = this.stroke;
      var isMouseDown = this.isMouseDown;
      var ctx = this.ctx;
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
          var radius = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
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
     * 
     * change cursor by type
     * @param {string} type
     * current type
     */

  }, {
    key: '_changeCursorByType',
    value: function _changeCursorByType(type) {
      if (type === ALL_TYPE.path) {
        this.canvas.freeDrawingCursor = this.cursor.path;
      } else {
        this.canvas.hoverCursor = this.cursor[type] || 'default';
        this.canvas.defaultCursor = this.cursor[type] || 'default';
      }
    }

    /**
     * render when mouse:up
     * @private
     * @return {undefined | fabric.Object}
     */

  }, {
    key: '_renderWhenMouseUp',
    value: function _renderWhenMouseUp() {
      var _o;

      var type = this.type;
      if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type || ALL_TYPE.text === type || ALL_TYPE.disabled === type || this.getObjects().length >= this.maxObjects) return;
      var startX = this.startX;
      var startY = this.startY;
      var endX = this.endX;
      var endY = this.endY;
      //if start pointer and ent pointer nearly , don't add it
      if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) return;
      var fillColor = this.fillColor;
      var strokeWidth = this.strokeWidth;
      var stroke = this.stroke;
      var strokeLineCap = this.strokeLineCap;
      var isMouseDown = this.isMouseDown;
      var ctx = this.ctx;
      var ratio = this.ratio;
      // mouseup _render at lowerCanvasEl with obj
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      var object = null;
      if (type === ALL_TYPE.path) {
        return this.canvas.getLastObject();
      }
      var o = (_o = {
        type: type,
        stroke: stroke,
        strokeWidth: strokeWidth,
        strokeLineCap: strokeLineCap
      }, _defineProperty(_o, 'strokeWidth', strokeWidth), _defineProperty(_o, 'fillColor', fillColor), _defineProperty(_o, 'id', this.generateID()), _o);

      switch (type) {
        case ALL_TYPE.line:
          o.x1 = startX - strokeWidth / 2;
          o.y1 = startY - strokeWidth / 2;
          o.x2 = endX - strokeWidth / 2;
          o.y2 = endY - strokeWidth / 2;
          break;
        case ALL_TYPE.circle:
          var radius = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
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

  }, {
    key: '_pushUndo',
    value: function _pushUndo(o) {
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

  }, {
    key: 'undo',
    value: function undo() {
      // if list length is 0 ,return 
      if (this.undoList.length === 0) return;
      // get the undo 
      var undo = this.undoList[this.undoList.length - 1];
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
      this.redoList.push(this.undoList.pop());
    }
    /**
     * 
     * redo
     * @returns {undefined}
     */

  }, {
    key: 'redo',
    value: function redo() {
      if (this.redoList.length === 0) return;
      var redo = this.redoList[this.redoList.length - 1];
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
     * @return {boolean} 
     * Indicates whether add success
     */

  }, {
    key: 'render',
    value: function render(opt, fireEVt) {
      var object = this._createObject(opt);
      if (object) {
        if (this.canvas.getObjectById(object.id)) return false;
        object.from = ALL_FROM.out;
        this.canvas.add(object);
        return true;
      }
    }
    /**
     * export setting interface
     * @param {Object} o
     * seting object
     * @return {boolean}
     * Indicates whether the settings are successful
     */

  }, {
    key: 'set',
    value: function set(o) {
      var flag = true;
      if (arguments.length == 2) {
        this[arguments[0]] = arguments[1];
        if (this[arguments[0]] !== arguments[1]) {
          flag = false;
        }
      } else {
        for (var prop in o) {
          if (o.hasOwnProperty(prop)) {
            var value = o[prop];
            this[prop] = value;
            if (this[prop] !== value) {
              flag = false;
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

  }, {
    key: 'clear',
    value: function clear(o) {
      var backgroundImage = this.backgroundImage;
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

  }, {
    key: 'remove',
    value: function remove(object) {
      if (!object) return;
      if (typeof object.remove == 'function') {
        object.from = ALL_FROM.out;
        object.remove();
        return;
      }
      if (object.id || object) {
        var o = this.canvas.getObjectById(object.id || object);
        if (o) {
          o.from = ALL_FROM.out;
          o.remove();
        }
      }
    }

    /**
     * @param {string | Element} img
     * the url of the background image or the img element 
     */

  }, {
    key: 'loadBackgroundImage',
    value: function loadBackgroundImage(img) {
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
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

  }, {
    key: 'resize',
    value: function resize(ratio) {
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

  }, {
    key: 'setTextareaPosition',
    value: function setTextareaPosition(left, top) {
      this._textarea.style.left = this.startX * this.ratio + 'px';
      this._textarea.style.top = (this.startY - this.fontSize / 2) * this.ratio + 'px';
    }
    /**
     * 
     * set textarea style
     * @param {object} obj 
     */

  }, {
    key: 'setTextareaStyle',
    value: function setTextareaStyle(obj) {
      if (!obj) return;
      if (arguments.length == 1) {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            var element = obj[key];
            this._textarea.style[key] = element;
          }
        }
      } else {
        this._textarea.style[arguments[0]] = arguments[1];
      }
    }
    /**
     * event proxy
     * @see EventProxy
     */

    /**
     * logger factory
     * @see Logger
     */

  }, {
    key: 'setDebugMode',


    /**
     * 
     * set debug mode
     * @param {boolean} debugMode 
     */
    value: function setDebugMode(debugMode) {
      this.log.setMode(debugMode);
    }
    /**
     * clear all fabrci.Obejct and backgroundImage 
     * @param {Object} obj 
     * new setting param
     */

  }, {
    key: 'reset',
    value: function reset(obj) {
      this.clear({
        removeBg: true
      });
      if (obj instanceof Object) {
        this.originalHeight = obj.height;
        this.originalWidth = obj.width;
        this.set(obj);
      }
    }
  }, {
    key: 'destory',
    value: function destory() {
      if (typeof this.beforeDestroy === 'function') {
        this.beforeDestroy();
      }
      //clear objects
      this.clear({
        removeBg: true,
        notFire: true
      });
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
      this.ep.fire(All_EVT.destory);
    }
  }, {
    key: 'getObjects',
    value: function getObjects() {
      var arr = [];
      this.canvas.getObjects().forEach(function (obj) {
        arr.push(obj.exportKeyAttr());
      });
      return arr;
    }
    /**
     * 
     * get item by id
     * @param {string} id 
     *  object id
     */

  }, {
    key: 'getObjectById',
    value: function getObjectById(id) {
      return this.canvas.getObjectById(id);
    }
    /**
     * get last object
     * 
     */

  }, {
    key: 'getLastObject',
    value: function getLastObject() {
      return this.canvas.getLastObject();
    }
    /**
     * 
     * set cursor
     * @param {string} type 
     * @param {string} cursor 
     */

  }, {
    key: 'setCursor',
    value: function setCursor(type, cursor) {
      if (type === ALL_TYPE.path) {
        this.canvas.freeDrawingCursor = cursor;
      }
      if (arguments.length === 2) {
        this.cursor[type] = cursor;
      } else {
        for (var _type in this.cursor) {
          if (this.cursor.hasOwnProperty(_type)) {
            this.cursor[_type] = cursor;
          }
        }
      }
    }
  }]);

  return WhiteBoard;
}();

var _initialiseProps = function _initialiseProps() {
  this.eventHandler = {
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#mouse:down
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    mousedown: function mousedown(opt) {
      if (opt.e.button === 2) return;
      // set start pointer
      var pointer = this.canvas.getPointer(opt.e);
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
    mouseup: function mouseup(opt) {
      if (opt.e.button === 2) return;
      //set end point
      var pointer = this.canvas.getPointer(opt.e);
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
    mousemove: function mousemove(opt) {
      if (this.getObjects().length >= this.maxObjects) {
        if (this.type === ALL_TYPE.path) {
          this.canvas.isDrawingMode = false;
          this.canvas.hoverCursor = this.cursor[ALL_TYPE.path];
          this.canvas.defaultCursor = this.cursor[ALL_TYPE.path];
        }
      } else {
        if (this.type === ALL_TYPE.path) {
          this.canvas.isDrawingMode = true;
        }
      }
      // if is not mousedown, do nothing
      if (!this.isMouseDown) return;

      // set end point
      var pointer = this.canvas.getPointer(opt.e);
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
    mouseover: function mouseover() {
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
    mouseout: function mouseout() {
      /**
       * @event mouseout
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire('mouse:out');
    },
    pathCreated: function pathCreated(o) {
      //TODO:
    },
    /**
     * @memberof WhiteBoard
     * @listens fabric.canvas#object:added
     * @param {Object} opt 
     * @returns {undefined}
     * @see http://fabricjs.com/docs/fabric.Canvas.html
     */
    objectAdded: function objectAdded(o) {
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
    objectRemoved: function objectRemoved(o) {
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
    objectModified: function objectModified(o) {
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
    allObjectsRemoved: function allObjectsRemoved(o) {
      /**
       * clear the canvas
       * @event clear
       * @param {fabric.Object} param.object
       * pass event target 
       * @see http://fabricjs.com/docs/fabric.Object.html
       */
      this.ep.fire(All_EVT['clear'], o);
    } };
  this.ep = new ep();
  this.log = new Logger(true);
};

WhiteBoard.version = version;
global.WhiteBoard = WhiteBoard;
module.exports = WhiteBoard;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
 * @Author: Liu Jing 
 * @Date: 2017-10-18 11:19:55 
 * @Last Modified by:   Liu Jing 
 * @Last Modified time: 2017-10-18 11:19:55 
 */
module.exports = {
  ver: '2017-10-18'
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
 * @Author: Liu Jing 
 * @Date: 2017-10-18 11:20:08 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-11-10 16:05:44
 */

module.exports = {
  disabled: 'default',
  path: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAACJUlEQVRIib3WMWgTYRTA8f/Vu6UoiIOxLm7lkAtkkHQrlSwOFzPo0K1IYgh6ODgUSsUtHYqIRzuUQnaHQiCX0Sp0MpCgYMhQcWjAgl10MBl6oc+hfHCGJG0v1zz4huN7x4/3vu8dp4kIY8Y0cAe4ChwAR8MSpyKA5nd2dt47jvOp2+3mgZmh2SISdk2LyINKpfIzHo+LaZriOI50Op3XIjIz6J2w0HUReex53i8FJRKJM8Gw0JLrur6CXNeVZrN5PDc3NxIM07pHGxsbx6ZpimmasrKyIiLyUUS2a7Xa51Hghc8o2DrTNMWyLKnX6/si8kZE3o0CQ1+G4LIsS2q12pcR4CsRuamdY86mgXnP80qrq6u3fd8fmKTrOqVS6WsymdwFrrVarSeLi4uG7/ukUqnO5ubm/bPm7FwQQK/XI5vNJhqNxkPgbrvdNnzfxzAMFhYWfgB/R1V2bqi/wkwmQ7Va5eTkhGKxeJhOp7PA3jAsFBQMwzBYW1s7sm17CdgDuoPaODYEkMvlerZtP1cQgB41ZBgG+XzedxznKfBBQf1YlK17BuwCf4L7CosEKhaLh7ZtZwm0LhhTUULq1g2CFDZbLpfdy4YUFt/a2pq9bEhhNyYBKUybBKSwiUDQN9TLL5f/21x/ux4ZBBeobFwITivrqYf+SqKEFHYQi8V6uq73fycB0DSNQqHwPZ1OvxgHAtBE5BZwj9O/2isDcn4D34D9cSCAf8MgsZhSaG//AAAAAElFTkSuQmCC) 0 24,auto',
  rect: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAAhUlEQVRIie3WwQ6AIAwD0Nbw/788D4pRgyErEj10F4XEPYZmQogREXEaUsmxqDgAkJL5Dj4axo0bNz41SvaBW08/pvdrqt+mceDa0+t9e00d/KESNVK5CjD+d1JyRMSGZ4tvQdK2M7nkzmua/8FVn6RUsYzXnfr8GDUaxo0bN/5ffPQosAJUaitEFUQoywAAAABJRU5ErkJggg==) 15 15,auto',
  circle: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAAhUlEQVRIie3WwQ6AIAwD0Nbw/788D4pRgyErEj10F4XEPYZmQogREXEaUsmxqDgAkJL5Dj4axo0bNz41SvaBW08/pvdrqt+mceDa0+t9e00d/KESNVK5CjD+d1JyRMSGZ4tvQdK2M7nkzmua/8FVn6RUsYzXnfr8GDUaxo0bN/5ffPQosAJUaitEFUQoywAAAABJRU5ErkJggg==) 15 15,auto',
  eraser: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAACxUlEQVRIiaXWsUsbURzA8a85lWCpaBxKG89BTJcu6pFkcIiTIHZxcJfGQWuGEwfTTtJWqINYJMJRaP+Agl2KxUIzqSAVMUShmGhBhZYWdRCqaXrnr4ONRLwkZ/zBm957fN7vd/d4vwoRocyoAhqBu8BPYB/IFlwtIuWMKhFpTSQS78Lh8J/V1dUFEekQEXehPWUjyWTyQ3d3t/T29orf75fFxcWvIhIqhN0IGR4eFk3TRNM08fv9srS0tFUIc13zmzzY2Nh4PjY29rC5uZmVlZWLybOzM0ZGRu4vLy+/BoKAO3+zU6go4gRzAjlCSmEVJX7vayH54XK5mJ6e3uro6BgAvhSDykbysVgs9jkQCDwuVLobIwBerxfDMELAHTvoEtLS0lIWEggEODk5IRKJfAR+VNohyWTyRTQa7ens7CSTyaAoCpZlXQvZ2dlhcnLyU2tr6zNgLz+jK4hpmtTX19PT04OiKI6QYDCYjzwFNoC/OegSEgqFME0TXdcZGhrC4/E4woLBINvb21cQOL9HVxDLstB1nZqaGiorKxkcHCyJFUNyUGMikXhih+SiFFYKgfMLGwyHw/Ha2tpb2WyWiYkJ6urqbE9tmiaGYXB0dMT8/DyWZTlCAJTx8XFXW1vb7bm5Ob/X6yWVSqFpmm2JXC4X7e3tbG5uoqoqHo+HdDpdEsmV7ntTU9Orqampt+l0moODA2ZnZ8lm7R9L0zQ5PT3F7XaTSqUcIbnSAShA8/7+fnR0dPSRz+ejoaGBSCRCdXX1xeJMJsPMzAwA8XjcMZLLCMACvqmq+jKX2eHhIbFY7CKzmyD5GeXCNrOBgQEMwygbsYNssePjY1RVLRsBCvYMioj49vb23vT19Ymu69LV1SXr6+sLItL+v3e4Vr9RbFIREd/u7u5sf3//77W1tfflIiJS8oVVgHuAF/jFeZPovFx58Q+5/vFGcvdG4AAAAABJRU5ErkJggg==) 10 26,auto',
  text: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAgCAYAAADqgqNBAAACvklEQVRIicWXP2hTURTGv/taa0JSrSBoa3HQog0WxMkipRhw6OjQQEUEHTvo4KiYNpihWoiD0EHRVWm14MukhUqo9Q84dFEKFhyFIBSSgiFEfg7Ng2vUevMi9oMzfO+e853757z7zhOQB1S3+8AZi98ALlj8EnDN4iPAHYufAB5bvBt4ZfGdwEfAAPKMMQpgjNH/4PVn7wyg7UBXV9d7A8Qlbfzv5MaYuFer1V46+t+WVJa0KCnVMDYmqSCpJOmWixiwIUlvrYLYysrxeJxkMkk+nwe4DuwDJufn5xkeHqazsxOg5Kj3wsUpsNu1Wo21tTUymQzZbBZgcmJigv7+fnzfp1QqAdxy0RsYGFhSUPaO1gYcBtLLy8tMTU3R29tLsVgEuAJ0umpJOqT6e9fMDgQ2Nzo6Si6Xo+Hddza1t7eHTf6pr6+P1dVVgKMh4u8ZSW3Ad8eKt/EtGo1G1tfXFYlEopIqzQSnUqlnrVwyGGOC8zN/c26EMeaUJ+lN2OytAHjt9fT0tG9HckkZI2kv8DVEcEvbns1mn27nmZ/zJM2Fzd4KgEfe0NDQLkf/GUlY9pOWZTOOeuNG0jHgg8tk7cbgj06OxzA7O/ukmRtphgZs5voFM453+1UBd0Ner3byMPHyxsfHDzps+e9QiUQiqlQqkhQJET8iSSPb8WFZWVmZbwPWQq78dKFQSFSrVQ0ODn6RtNRMcHd390mx2Q65znirZuIyEG9m9crlck8dnad/00Zl0uk0iUQC3/cpl8sA0456xyXpoqPzRiwWI5lM4vs+9R3bD2SCBjIWiwFsuOgVi8WmGsjpuvAikGoYGwMK9XGnlUuaE3C+2Ur9V+YtLCycDVntreKAJN1g88/0oTWrI8Bzi+8G3lvcAB+AHdazd8Aei+frOgF/ACQDXq1WP3vAzRb/NpuKCdDR0VH7AYf/4Src2y6/AAAAAElFTkSuQmCC) 0 10,auto'
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @Author: Liu Jing 
 * @Date: 2017-10-18 11:20:05 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-11-03 15:39:09
 */

var EventProxy = function () {
  /**
   * Creates an instance of EventProxy.
   */
  function EventProxy() {
    _classCallCheck(this, EventProxy);

    this.event = {};
  }
  /**
   * fire event
   * @param {string} evt 
   * @param {any} data 
   * @returns {undefined}
   */


  _createClass(EventProxy, [{
    key: "fire",
    value: function fire(evt, data) {
      var event = this.event[evt];
      if (!event) return;
      event.cbs.forEach(function (cb) {
        cb(data);
      });
    }
    /**
     * add event listener
     * @param {string} evt 
     * @param {function} cb 
     */

  }, {
    key: "on",
    value: function on(evt, cb) {
      if (this.event[evt]) {
        this.event[evt].cbs.push(cb);
      } else {
        this.event[evt] = {
          evt: evt,
          cbs: [cb]
        };
      }
    }
  }]);

  return EventProxy;
}();

module.exports = EventProxy;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
 * @Author: Liu Jing 
 * @Date: 2017-10-20 09:35:47 
 * @Last Modified by:   Liu Jing 
 * @Last Modified time: 2017-10-20 09:35:47 
 */
module.exports = function () {
  if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs) {
        // .length of function is 2
        'use strict';

        if (target == null) {
          // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource != null) {
            // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @Author: Liu Jing 
 * @Date: 2017-10-23 10:06:02 
 * @Last Modified by: Liu Jing
 * @Last Modified time: 2017-11-06 14:54:52
 */
var Logger = function () {
  /**
   * Creates an instance of Logger.
   * @param {boolean} [debug=true] 
   */
  function Logger() {
    var debug = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    _classCallCheck(this, Logger);

    this.debugMode = debug;
  }
  /**
   * 
   * debug out
   * @returns {undefined}
   */


  _createClass(Logger, [{
    key: "debug",
    value: function debug() {
      if (!this.debugMode) return;
      console.debug.apply(console, arguments);
    }
    /**
     * 
     * error out
     * @returns {undefined}
     */

  }, {
    key: "error",
    value: function error() {
      if (!this.debugMode) return;
      if (!this.debugMode) return;
      console.error.apply(console, arguments);
    }
    /**
     * info out
     * @returns {undefined}
     */

  }, {
    key: "info",
    value: function info() {
      if (!this.debugMode) return;
      console.info.apply(console, arguments);
    }
    /**
     * log out
     * @returns {undefined}
     */

  }, {
    key: "log",
    value: function log() {
      if (!this.debugMode) return;
      console.log.apply(console, arguments);
    }
    /**
     * 
     * 
     */

  }, {
    key: "warn",
    value: function warn() {
      if (!this.debugMode) return;
      console.warn.apply(console, arguments);
    }
    /**
     * 
     * set debug model
     * @param {boolean} [debugMode=true] 
     * @memberof Logger
     */

  }, {
    key: "setMode",
    value: function setMode() {
      var debugMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.debugMode = !!debugMode;
    }
  }]);

  return Logger;
}();

module.exports = Logger;

/***/ })
/******/ ]);