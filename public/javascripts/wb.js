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

	var global = window;
	var doc = document;
	var body = doc.body;
	var EventProxy = __webpack_require__(1);
	var defaultConfig = {
		id: '',
		fabric: {
			width: 500,
			height: 375,
			startX: 0,
			startY: 0,
			endx: 0,
			endY: 0
		},
		setting: {
			undoMax: 10,
			type: 'pencil',
			fontSize: 16,
			lineWidth: 2,
			color: '#222',
			fillColor: 'rgba(0, 0, 0, 0)',
			isDrawingMode: true
		}
	};

	/**
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
   }
  */
	function Draw(o) {
		this.config = defaultConfig;
		this.config.id = o.id;
		if (o.fabric instanceof Object) {
			for (var k in o.fabric) {
				this.config.fabric[k] = o.fabric[k];
			}
		}
		if (o.setting instanceof Object) {
			for (var _k in o.setting) {
				this.config.setting[_k] = o.setting[_k];
			}
		}
	};

	/**
  * 
  * 实例化一个fabric canvas
  * @returns
  * 
  */
	function init() {
		//创建fabric canvas
		if (!check.apply(this)) return console.error('参数配置有误');
		initFabric.apply(this);
		listener(this);
	}

	/**
  * 
  * 检查传入的参数是否正确（是否为对象，是否找得到对应的元素）
  * @returns
  */
	function check() {
		var id = this.config.id;
		if (!id) return console.error('初始化参数不正确');
		var container = doc.getElementById(id);
		return container === null ? false : true;
	}

	/**
  * 初始化时监听的事件
  */
	function listener(instance) {
		var self = instance;
		var canvasEvt = {
			'canvas:modified': 'canvasModified',
			'mouse:down': 'mousedown',
			'mouse:up': 'mouseup',
			'mouse:move': 'mousemove',
			'object:added': 'objectAdded',
			'object:modified': 'objectModified',
			'object:removed': 'objectRemoved'
		};

		var _loop = function _loop(x) {
			self.canvas.on(x, function (opt) {
				var handler = canvasEventHandler[canvasEvt[x]];
				if (!handler) return;
				handler.apply(self, [opt]);
			});
		};

		for (var x in canvasEvt) {
			_loop(x);
		}
		var instanceEvt = {
			'setting:modified': 'settingModified'
		};

		var _loop2 = function _loop2(x) {
			self.ep.on(x, function (opt) {
				var handler = instanceEventHandler[instanceEvt[x]];
				if (!handler) return;
				handler(self, [opt]);
			});
		};

		for (var x in instanceEvt) {
			_loop2(x);
		}
	}

	/**
  * 
  * 初始化fabric
  */
	function initFabric() {
		var id = this.config.id;
		this.canvas = new fabric.Canvas(id, this.config.fabric);
		this.ctx = this.canvas.upperCanvasEl.getContext('2d');
		// 增加原型方法
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
		//增加原型方法
		fabric.Canvas.prototype.getLastItem = function () {
			var objects = this.getObjects();
			return objects[objects.length - 1];
		};
	}

	/**
  * 绘制函数
  */
	function render(data) {
		var startX = this.canvas.startX;
		var startY = this.canvas.startY;
		var endx = this.canvas.endX;
		var endY = this.canvas.endY;
		var fillColor = this.data.fillColor;
		var strokeWidth = this.data.strokeWidth;
		var strokeColor = this.data.strokeColor;
		/**
   * 
   * 绘制线条
   * @param {any} data
   *线条数据，开始结束的位置
   */
		function line(data) {
			var line = new fabric.Line([data.startX - data.lineWidth / 2, data.startY - data.lineWidth / 2, data.endX - data.lineWidth / 2, data.endY - data.lineWidth / 2], {
				stroke: data.strokeColor,
				strokeWidth: data.strokeWidth,
				radius: 90,
				id: new Date().getTime()
			});
			this.canvas.add(line);
		}

		/**
   * 
   * 绘制圆
   * @param {any} data
   *圆心，半径
   */
		function circle(type) {
			var circle = new fabric.Circle({
				top: data.startY - data.radius - data.lineWidth / 2,
				left: data.startX - data.radius - data.lineWidth / 2,
				radius: data.radius,
				fill: '',
				stroke: data.strokeColor,
				strokeWidth: data.strokeWidth
			});
			this.canvas.add(circle);
		}

		/**
   * 
   * 绘制方形
   * @param {any} data
   *起点，终点
   */
		function square(data) {
			var square = new fabric.Rect({
				width: Math.abs(data.endX - data.startX),
				height: Math.abs(data.endY - data.startY),
				top: data.startY <= data.endY ? data.startY - data.lineWidth / 2 : data.endY - data.lineWidth / 2,
				left: data.startX <= data.endX ? data.startX - data.lineWidth / 2 : data.endX - data.lineWidth / 2,
				fill: '',
				stroke: data.strokeColor,
				strokeWidth: data.strokeWidth
			});
			this.canvas.add(square);
		}
		switch (type.type) {
			case 'pencil':

				break;
			case 'line':
				line(type.data);
				break;
			case 'circle':
				circle(type.data);
				break;
			case 'square':
				square(type.data);
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
	}
	var instanceEventHandler = {
		settingModified: function settingModified(s) {
			for (var k in s) {
				this.config.setting[k] = s[k];
			}
		}
	};
	var canvasEventHandler = {
		canvasModified: function canvasModified(s) {
			for (var k in s) {
				this[k] = s[k];
			}
		},
		mousedown: function mousedown(opt) {
			this.trigger('canvas:modified', {
				startX: opt.e.clientX - draw.canvas._offset.left,
				startY: opt.e.clientY - draw.canvas._offset.top
			});
		},
		mouseup: function mouseup(opt) {
			this.trigger('canvas:modified', {
				endX: opt.e.clientX - draw.canvas._offset.left,
				endY: opt.e.clientY - draw.canvas._offset.top
			});
		},
		objectAdded: function objectAdded(o) {
			o.target.id = new Date().getTime() + Math.floor(Math.random() * 10);
		}
	};

	//  配置初始化函数
	Draw.prototype.init = init;

	Draw.prototype.render = render;

	Draw.prototype.ep = new EventProxy();

	global.Draw = Draw;

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