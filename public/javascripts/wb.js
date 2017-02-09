'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

	/*@const require*/
	var version = __webpack_require__(1);
	var cursor = __webpack_require__(2);
	var ep = __webpack_require__(3);

	/*@const global var*/
	var global = window;
	var doc = document;

	/*@const default var*/
	var DEFAULT_CONFIG = {
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
		generateID: function generateID() {
			// 生成对象id的函数
			return new Date().getTime() + Math.floor(Math.random() * 100);
		},
		wrap: null // 支持一般的查找 当canvas过大导致滚动时，对鼠标的定位需要加上scrollTop和scrollLeft。必须设置，否则溢出时鼠标位置计算出错
	};
	var ALL_TYPE = {
		'path': 'path',
		'circle': 'circle',
		'rect': 'rect',
		'line': 'line',
		'eraser': 'eraser',
		'clear': 'clear'
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
		draw: 'draw', // 操作来自_render
		undo: 'undo', // 操作来自undo,redo
		out: 'out' // 操作来自render
	};

	/**
  * @private 
  * 给实例的setting设置一个setter方法
  */
	function _defineSetter() {

		Object.defineProperty(this, 'setting', {

			get: function get() {
				return this._setting;
			},

			set: function set(o) {

				if (!(o instanceof Object)) return console.error('参数错误');

				for (var k in o) {

					var v = o[k];

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
								this._setting.strokeWidth = 2;
							}

							break;
						case 'ratio':
							var width = this.setting.width;
							var height = this.setting.height;
							var backgroundImage = this.canvas.backgroundImage;

							this.canvas.setWidth(width * v);
							this.canvas.setHeight(height * v);

							this.canvas.setZoom(v);
							break;
						case 'generateID':
							if (typeof v !== 'function') {
								this._setting.generateID = function () {
									return new Date().getTime() + Math.floor(Math.random() * 100);
								};
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

	var eventHandler = {

		//所有回调事件都通过各自分发，做进一步管控解耦

		mousedown: function mousedown(opt) {
			// `this` is a this of WhiteBoard ,use apply bind runtime context
			// 设置起点
			var wrap = document.querySelector(this.setting.wrap);
			this.setting = {
				startX: opt.e.clientX - this.canvas._offset.left,
				startY: opt.e.clientY - this.canvas._offset.top,
				isMouseDown: true
			};
			// 如果是橡皮，则删除
			if (this.setting.type === ALL_TYPE.eraser) {
				opt.target && opt.target.remove();
			}
			// 触发mouse:down 事件
			this.ep.fire(All_EVT['mouse:down'], {
				object: opt.target
			});
		},
		mouseup: function mouseup(opt) {
			//设置终点
			var wrap = document.querySelector(this.setting.wrap);
			this.setting = {
				endX: opt.e.clientX - this.canvas._offset.left,
				endY: opt.e.clientY - this.canvas._offset.top,
				isMouseDown: false
			};

			// 绘制
			_render.apply(this);
			//触发 mouse:up 事件
			this.ep.fire(All_EVT['mouse:up'], {
				object: opt.target
			});
		},
		mousemove: function mousemove(opt) {
			// 如果不是鼠标点下则返回
			if (!this.setting.isMouseDown) return;
			// 设置终点
			var wrap = document.querySelector(this.setting.wrap);
			var endX = opt.e.clientX - this.canvas._offset.left;
			var endY = opt.e.clientY - this.canvas._offset.top;
			//解决出界的效果 暂时屏蔽
			// endX > this.setting.width ? endX = this.setting.width : endX = endX;
			// endY > this.setting.height ? endY = this.setting.height : endY = endY;
			//设置当前参数
			this.setting = {
				endX: endX,
				endY: endY,
				isMouseDown: true
			};
			// 绘制
			_render.apply(this);
			// 触发 mouse:move事件
			this.ep.fire(All_EVT['mouse:move'], {
				object: opt.target
			});
		},
		mouseover: function mouseover() {
			//触发mouse:over事件
			this.ep.fire(All_EVT['mouse:over']);
		},
		mouseout: function mouseout() {
			// 触发mouse:out事件
			this.ep.fire('mouse:out');
		},
		pathCreated: function pathCreated(o) {
			// 因为object:added再mouseup之前，需要再此设置
			/*if (!('id' in o)) {
     o.id = this.setting.generateID();
   }
   if (!('from' in o)) {
     o.from = ALL_FROM.draw;
   }*/
		},
		objectAdded: function objectAdded(o) {
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
		objectRemoved: function objectRemoved(o) {
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
		objectModified: function objectModified(o) {
			// 触发回调
			this.ep.fire(All_EVT['object:modified'], {
				target: o.target
			});
		},
		allObjectsRemoved: function allObjectsRemoved(o) {
			// 触发回调
			this.ep.fire(All_EVT['clear'], o);
		}
	};
	/**
  * 初始化时注册监听事件
  */
	function _registerEventListener() {
		var _this = this;

		var self = this;

		var _loop = function _loop(x) {
			_this.canvas.on(x, function (opt) {
				var handler = eventHandler[All_EVT[x]];
				if (!handler) return;
				handler.apply(self, [opt]);
			});
		};

		for (var x in All_EVT) {
			_loop(x);
		}
	}

	/**
  * 
  * 初始化fabric
  */
	function _initFabric() {

		var id = this.id;

		delete this.id;

		this.canvas = new fabric.Canvas(id, {
			selection: false
		});

		fabric.Object.prototype.selectable = false;

		this.ctx = this.canvas.upperCanvasEl.getContext('2d');

		// 增加原型方法 getItemById

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
		//增加原型方法 getLastItem
		fabric.Canvas.prototype.getLastItem = function () {

			var objects = this.getObjects();

			return objects[objects.length - 1];
		};
		//增加原型方法 removeAllObjects

		/**
   * @param {Boolean} removeBg
   * 是否删除背景图 默认为false
   */
		fabric.Canvas.prototype.removeAllObjects = function (obj) {

			var objects = this.getObjects().slice();

			try {
				this.fire('allObjects:removed', obj);
			} catch (error) {}

			var backgroundImage = this.backgroundImage;

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
					strokeLineJoin: 'round',
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
					id: o.id
				});
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
		if (!(o instanceof Object)) return console.error('初始化参数不正确');
		var container = doc.getElementById(o.id);

		if (!container) return console.error('初始化参数不正确');

		this.id = o.id;

		// 初始化fabrci
		_initFabric.apply(this);

		// 注册事件监听器  
		_registerEventListener.apply(this);

		// 设置setting的getter和setter  
		_defineSetter.apply(this);

		// 将初始化参数赋值给setting  
		for (var k in o) {
			this.setting = o;
		}
	}

	/**
  *@private
  * 绘制成对象渲染
  */
	function _render() {
		var setting = this.setting;
		var type = setting.type;
		if (ALL_TYPE[type] === undefined || ALL_TYPE.eraser === type) return;
		var startX = setting.startX;
		var startY = setting.startY;
		var endX = setting.endX;
		var endY = setting.endY;
		//这里做个判断，如果起点与终点均过于小则不添加
		if (Math.abs(startX - endX) < 5 && Math.abs(startY - endY) < 5) return;

		var fillColor = setting.fillColor;
		var strokeWidth = setting.strokeWidth;
		var stroke = setting.stroke;
		var isMouseDown = this.setting.isMouseDown;
		// mousemove _render at upperCanvasEl with temp 
		if (isMouseDown) {
			if (ALL_TYPE.path === type) return;
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			var ctx = this.ctx;
			ctx.strokeStyle = stroke;
			//原生api
			ctx.lineWidth = strokeWidth * setting.ratio;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();

			var wrap = document.querySelector(this.setting.wrap);
			var ratio = setting.ratio;
			startX = startX + wrap.scrollLeft;
			startY = startY + wrap.scrollTop;
			endX = endX + wrap.scrollLeft;
			endY = endY + wrap.scrollTop;
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

		// mouseup _render at lowerCanvasEl with obj
		else {
				var _o;

				// 鼠标up，清空上层
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				// 创建一个空对象
				var object = null;
				//如果是path，对象直接生成，返回这个path
				if (type === ALL_TYPE.path) {
					return this.canvas.getLastItem();
				}
				// 根据缩放比计算坐标点
				var _ratio = setting.ratio;
				var _wrap = document.querySelector(this.setting.wrap);
				startX = (startX + _wrap.scrollLeft) / _ratio;
				startY = (startY + _wrap.scrollTop) / _ratio;
				endX = (endX + _wrap.scrollLeft) / _ratio;
				endY = (endY + _wrap.scrollTop) / _ratio;

				// 定义绘制对象的通用属性
				var o = (_o = {
					type: type,
					stroke: stroke,
					strokeWidth: strokeWidth,
					strokeLineCap: 'round'
				}, _defineProperty(_o, 'strokeWidth', strokeWidth), _defineProperty(_o, 'fillColor', fillColor), _defineProperty(_o, 'id', this.setting.generateID()), _o);
				// 根据type不同(line || circle  || arc)给o增加属性

				switch (type) {
					case ALL_TYPE.line:
						o.x1 = startX - strokeWidth / 2;
						o.y1 = startY - strokeWidth / 2;
						o.x2 = endX - strokeWidth / 2;
						o.y2 = endY - strokeWidth / 2;
						break;
					case ALL_TYPE.circle:
						var _radius = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
						o.top = startY - _radius - strokeWidth / 2;
						o.left = startX - _radius - strokeWidth / 2;
						o.radius = _radius;
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

		var object = _createObject(opt);

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
		var undo = this.undoList[this.undoList.length - 1];
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
		this.redoList.push(this.undoList.pop());
	}

	/**
  * 恢复操作
  */
	function redo() {
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
		var backgroundImage = this.backgroundImage;
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
		var object = this.canvas.getItemById(opt.id);
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
		});
	}
	/**
  * @param {Number} ratio
  * 缩放比例
  */
	function resize(ratio) {
		var width = this.setting.width;
		var height = this.setting.height;
		var backgroundImage = this.canvas.backgroundImage;

		this.canvas.setWidth(width * ratio);
		this.canvas.setHeight(height * ratio);

		this.canvas.getObjects().forEach(function (obj) {
			obj.set({
				width: obj.width * ratio,
				height: obj.height * ratio,
				top: obj.top * ratio,
				left: obj.left * ratio
			});
		});
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

	/***/
},
/* 1 */
/***/function (module, exports) {

	module.exports = {
		ver: '2017-01-19'
	};

	/***/
},
/* 2 */
/***/function (module, exports) {

	module.exports = {
		eraser: 'url(data:image/png;base64,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),auto'
	};

	/***/
},
/* 3 */
/***/function (module, exports) {

	function EventProxy() {
		this.event = {};
	};
	EventProxy.prototype = {
		fire: function fire(evt, data) {
			var event = this.event[evt];
			if (!event) return;
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