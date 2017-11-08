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
 * @Last Modified time: 2017-11-08 12:23:15
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
  allowDrawing: true, // allow drawing
  selectable: false, // object can select, ensure this value is false at this version
  strokeLineCap: 'round', // line cap
  strokeLineJoin: 'round', // line join
  generateID: function generateID() {
    // generate the id of object
    return new Date().getTime() + Math.floor(Math.random() * 100);
  },
  maxSize: 4096 //the max width or max height of the canvas element @see https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
};
var ALL_TYPE = {
  'path': 'path',
  'circle': 'circle',
  'rect': 'rect',
  'line': 'line',
  'eraser': 'eraser',
  'clear': 'clear',
  'text': 'text'
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
  'clear': 'clear'
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

  function WhiteBoard(o) {
    _classCallCheck(this, WhiteBoard);

    _initialiseProps.call(this);

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
      textarea.addEventListener('blur', function (e) {
        e.stopPropagation();
        if (self.type !== ALL_TYPE.text) return this.style.display = 'none';
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
          fill: this.fill,
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
      fabric.Canvas.prototype.getItemById = function (id) {
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
      fabric.Canvas.prototype.getLastItem = function () {

        var objects = this.getObjects();

        return objects[objects.length - 1];
      };
      /**
       * 
       * @param {object} obj
       * @param {boolean} obj.removeBg
       * 是否删除背景图
       */
      fabric.Canvas.prototype.removeAllObjects = function (obj) {
        var objects = this.getObjects().slice();
        this.fire('allObjects:removed', obj);
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
          _this[prop] = value;
        }
      };

      for (var prop in this._setting) {
        _loop(prop);
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
        case 'allowDrawing':
          this.canvas.isDrawingMode = !!value && this.type === ALL_TYPE.path;
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
          return new fabric.Line([o.x1, o.y1, o.x2, o.y2], {
            stroke: o.stroke,
            strokeWidth: o.strokeWidth,
            radius: 90,
            strokeLineCap: o.storkeLineCap,
            id: o.id
          });
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
          });
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
          });
          break;
        case ALL_TYPE.path:
          return new fabric.Path(o.path, {
            stroke: o.stroke,
            strokeWidth: o.strokeWidth,
            fill: o.fill,
            strokeLineCap: o.storkeLineCap,
            id: o.id
          });
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
      if (!this._setting.allowDrawing) return;
      var type = this.type;
      if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type || ALL_TYPE.path === type) return;
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
     * render when mouse:up
     * @private
     * @return {undefined | fabric.Object}
     */

  }, {
    key: '_renderWhenMouseUp',
    value: function _renderWhenMouseUp() {
      var _o;

      if (!this._setting.allowDrawing) return;
      var type = this.type;
      if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type || ALL_TYPE.text === type) return;
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
        return this.canvas.getLastItem();
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
     */

  }, {
    key: 'render',
    value: function render(opt) {
      var object = this._createObject(opt);
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
      if (typeof object.remove == 'function') {
        object.remove();
      }
      if (object.id) {
        var o = this.canvas.getItemById(object.id);
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

  }, {
    key: 'loadBackgroundImage',
    value: function loadBackgroundImage(url) {
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
 * @Last Modified by:   Liu Jing 
 * @Last Modified time: 2017-10-18 11:20:08 
 */

module.exports = {
  eraser: 'url(data:image/png;base64,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),auto'
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