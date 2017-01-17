'use strict';

/******/(function (modules) {
	// webpackBootstrap
	/******/ // The module cache
	/******/var installedModules = {};

	/******/ // The require function
	/******/function __webpack_require__(moduleId) {

		/******/ // Check if module is in cache
		/******/if (installedModules[moduleId])
			/******/return installedModules[moduleId].exports;

		/******/ // Create a new module (and put it into the cache)
		/******/var module = installedModules[moduleId] = {
			/******/exports: {},
			/******/id: moduleId,
			/******/loaded: false
			/******/ };

		/******/ // Execute the module function
		/******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		/******/ // Flag the module as loaded
		/******/module.loaded = true;

		/******/ // Return the exports of the module
		/******/return module.exports;
		/******/
	}

	/******/ // expose the modules object (__webpack_modules__)
	/******/__webpack_require__.m = modules;

	/******/ // expose the module cache
	/******/__webpack_require__.c = installedModules;

	/******/ // __webpack_public_path__
	/******/__webpack_require__.p = "";

	/******/ // Load entry module and return exports
	/******/return __webpack_require__(0);
	/******/
})(
/************************************************************************/
/******/[
/* 0 */
/***/function (module, exports, __webpack_require__) {

	var EventProxy = __webpack_require__(1);
	var doc = document;
	var body = doc.body;
	var defaultConfig = {
		width: 500,
		height: 375,
		type: 'pencil',
		undoMax: 10,
		fontSize: 16,
		lineWidth: 1,
		color: '#222',
		fillColor: 'rgba(0, 0, 0, 0)'
	};

	/**
  * 
  * 
  * @param {any} o
  *{
     id: =>初始化fabric元素的id,
     setting:{
       undoMax: => 撤销操作的最大值 || 10
       fontSize => 文本字体大小 || 16px
       lineWidth => 线条宽度 || 1px
       color => 线条颜色 || #222
       fillColor => 填充颜色 || rgba(0,0,0,0)
     }
     fabric:{
       perPixelTargetFind: false, // api
       selection: false
     }
 
   }
  */
	function Draw(o) {
		this.config = o;
	};
	Draw.prototype = {
		ep: new EventProxy(),
		data: {
			undoArr: [],
			redoArr: [],
			setings: defaultConfig
		},
		startFreeDraw: function startFreeDraw() {
			this.canvas.isDrawingMode = true;
			this.canvas.freeDrawingBrush.width = 2;
			this.canvas.freeDrawingBrush.shadowBlur = 0;
		},
		methods: {
			undo: function undo(action) {
				this.data.undoArr.push(action);
			},
			redo: function redo(action) {
				this.data.redoArr.push(action);
			}
		},
		register: function register() {
			this.ep.on('setting.change', this.methods.changeSetting);
			this.ep.on('undo', this.methods.undo);
			this.ep.on('redo', this.methods.redo);
			this.ep.on('add', this.methods.draw);
			//this.ep.on('remove',this.methods.) 
		},
		init: function init(o) {
			//创建fabric canvas
			if (!this.check()) return;
			this.initFabric();
			this.ctx = this.canvas.upperCanvasEl.getContext('2d');
		},
		check: function check() {
			if (!this.config.id) return this.throw('初始化参数不正确');
			var container = doc.querySelector(this.config.id);
			return container === null ? true : false;
		},
		initFabric: function initFabric(o) {
			var id = this.config.id;
			this.changeSetting(this.config.setting);
			this.canvas = new fabric.Canvas(id, this.config.fabric);
			// 扩展object的id属性
			fabric.Canvas.prototype.getItemById = function (id) {
				var object = null,
				    objects = this.getObjects();
				for (var i = 0; i < this.size(); i++) {
					if (objects[i]['id'] && objects[i]['id'] === id) {
						object = objects[i];
						break;
					}
				}
				return object;
			};
		},
		changeSetting: function changeSetting(s) {
			for (var k in s) {
				this.settings[k] = s[k];
			}
		},
		draw: function draw(data) {

			switch (data.type) {
				case 'pencil':

					break;
				case 'line':

					break;
				case 'circle':

					break;
				case 'square':

					break;
				case 'eraser':

					break;
				case 'clear':

					break;
				case 'undo':

					break;
				case 'redo':

					break;
				default:
					break;
			}
		},
		throw: function _throw(msg) {
			throw new Error(msg);
		}

	};
	window.Draw = Draw;

	/***/
},
/* 1 */
/***/function (module, exports) {

	function EventProxy() {
		this.event = {};
	};
	EventProxy.prototype = {
		fire: function fire(evt, data) {
			var event = this.event[evt];
			if (!event instanceof Array) return;
			event.cbs.forEach(function (cb) {
				cb(data);
			});
		},
		on: function on(evt, cb) {
			if (this.event[evt]) {
				this.event[evt].cbs.push(cb);
			} else {
				this.event[evt] = {
					evt: evt,
					cbs: [cb]
				};
			}
		}
	};
	module.exports = EventProxy;

	/***/
}
/******/]);