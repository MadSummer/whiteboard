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

	var version = __webpack_require__(1);
	var cursor = __webpack_require__(2);
	var ep = __webpack_require__(3);
	var global = window;
	var doc = document;
	var DEFAULT_CONFIG = {
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
		strokeColor: '#222',
		fillColor: '',
		isMouseDown: false,
		action: null
	};
	var ALL_TYPE = {
		'pencil': 'pencil',
		'circle': 'circle',
		'square': 'square',
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
		'objects:removed': 'objectsRemoved'
	};
	/**
  * 
  * @param {Object} o
  *{
     id: =>初始化fabric元素的id,
     undoMax: => 撤销操作的最大值 || 10
     fontSize => 文本字体大小 || 16px
     strokeWidth => 线条宽度 || 1px
     strokeColor => 线条颜色 || #222
     fillColor => 填充颜色 || rgba(0,0,0,0)
   }
  */
	function WhiteBoard(o) {

		this.__setting = DEFAULT_CONFIG;

		this.init(o);
	}

	/**
  * 
  * 给实例的setting设置一个setter方法
  * @param {any} instance
  * fabric实例
  */
	function defineSetter(instance) {
		Object.defineProperty(instance, 'setting', {
			get: function get() {
				return instance.__setting;
			},
			set: function set(o) {
				if (!o instanceof Object) return console.error('参数错误');
				for (var k in o) {
					var v = o[k];
					instance.__setting[k] = v;
					switch (k) {
						case 'width':
							instance.canvas.setWidth(v);
							break;
						case 'height':
							instance.canvas.setHeight(v);
							break;
						case 'strokeColor':
							instance.canvas.freeDrawingBrush.color = v;
							break;
						case 'type':
							instance.canvas.isDrawingMode = false;
							instance.canvas.hoverCursor = 'default';
							instance.canvas.selectable = false;
							if (ALL_TYPE.pencil === v) {
								instance.canvas.isDrawingMode = true;
							}
							if (ALL_TYPE.eraser === v) {
								instance.canvas.hoverCursor = cursor.eraser;
							}
							break;
						case 'strokeWidth':
							instance.canvas.freeDrawingBrush.width = parseInt(v) > 2 ? parseInt(v) : 2;
							if (parseInt(v) === 1) {
								instance.__setting.strokeWidth = 2;
							}
							break;
						default:
							break;
					}
				}
			}
		});
		instance.setting = instance.__setting;
	}

	/**
  * 初始化时监听的事件
  */
	function listener(instance) {
		var _loop = function _loop(x) {
			instance.canvas.on(x, function (opt) {
				var handler = eventHandler[All_EVT[x]];
				if (!handler) return;
				handler.apply(instance, [opt]);
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
	function initFabric(instance) {
		var id = instance.id;
		delete instance.id;
		instance.canvas = new fabric.Canvas(id, {
			selection: false
		});
		fabric.Object.prototype.selectable = false;
		instance.ctx = instance.canvas.upperCanvasEl.getContext('2d');
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
   * 
   * 
   * @param {any} removeBg
   * 是否删除背景图 默认为false
   */
		fabric.Canvas.prototype.removeAllObjects = function (removeBg) {

			var objects = this.getObjects();
			try {
				this.fire('objects:removed', {
					target: objects
				});
			} catch (error) {}

			var bgi = this.backgroundImage;
			this.clear();
			if (!removeBg && bgi) {
				this.setBackgroundImage(bgi, this.renderAll.bind(this));
			}
		};
	}

	var eventHandler = {
		//所有回调事件都通过各自分发，做进一步管控解耦

		mousedown: function mousedown(opt) {
			// `this` is a instance of WhiteBoard ,use apply bind runtime context
			this.setting = {
				startX: opt.e.clientX - this.canvas._offset.left,
				startY: opt.e.clientY - this.canvas._offset.top,
				isMouseDown: true
			};
			if (this.setting.type === ALL_TYPE.eraser) {
				opt.target && opt.target.remove();
			}
			this.ep.fire('mouse:down', {
				object: opt.target
			});
		},
		mouseup: function mouseup(opt) {
			this.setting = {
				endX: opt.e.clientX - this.canvas._offset.left,
				endY: opt.e.clientY - this.canvas._offset.top,
				isMouseDown: false
			};
			this.render();

			this.ep.fire('mouse:up', {
				object: opt.target
			});
		},
		mousemove: function mousemove(opt) {
			if (!this.setting.isMouseDown) return;
			var endX = opt.e.clientX - this.canvas._offset.left;
			var endY = opt.e.clientY - this.canvas._offset.top;
			//解决出界的效果
			// 如果是圆呢？
			// endX > this.setting.width ? endX = this.setting.width : endX = endX;
			// endY > this.setting.height ? endY = this.setting.height : endY = endY;
			this.setting = {
				endX: endX,
				endY: endY,
				isMouseDown: true
			};
			this.render();
			this.ep.fire('mouse:move', {
				object: opt.target
			});
		},
		mouseover: function mouseover() {
			this.ep.fire('mouse:over');
		},
		mouseout: function mouseout() {
			this.ep.fire('mouse:out');
		},
		objectAdded: function objectAdded(o) {
			o.target.id = new Date().getTime() + Math.floor(Math.random() * 10);
			this.ep.fire('object:added', {
				object: o.target
			});
		},
		objectRemoved: function objectRemoved(o) {
			this.ep.fire('object:removed', {
				object: o.target
			});
		},
		objectModified: function objectModified(o) {
			this.ep.fire('object:modified', {
				object: o.target
			});
		},
		objectsRemoved: function objectsRemoved(o) {
			this.ep.fire('objects:removed', {
				object: o.target
			});
		}
	};

	/************** 以下为暴露给实例的方法******************/

	/**
  * 
  * 实例化一个fabric canvas
  * @returns
  * 
  */
	function init(o) {
		//创建fabric canvas
		if (!(o instanceof Object)) return console.error('初始化参数不正确');
		var container = doc.getElementById(o.id);

		if (!container) return console.error('初始化参数不正确');

		this.id = o.id;

		initFabric(this);

		listener(this);

		defineSetter(this);

		for (var k in o) {
			this.setting = o;
		}
	}

	/**
  * 绘制成对象渲染
  */
	function render(o) {
		var setting = this.setting;
		var type = setting.type;
		if (ALL_TYPE[type] === undefined || ALL_TYPE.pencil === type || ALL_TYPE.eraser === type) return;
		var startX = setting.startX;
		var startY = setting.startY;
		var endX = setting.endX;
		var endY = setting.endY;
		//这里做个判断，如果起点与终点均过于小则不添加
		if (Math.abs(startX - endX) < 1 && Math.abs(startY - endY) < 1) return;

		var fillColor = setting.fillColor;
		var strokeWidth = setting.strokeWidth;
		var strokeColor = setting.strokeColor;

		var isMouseDown = this.setting.isMouseDown;
		this.ctx.clearRect(0, 0, setting.width, setting.height);
		// mousemove render at upperCanvasEl with temp 
		if (isMouseDown) {
			var ctx = this.ctx;
			ctx.strokeStyle = strokeColor;
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
					var radius = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
					ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
					break;
				case ALL_TYPE.square:
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
		// mouseup render at lowerCanvasEl with obj
		else {
				var createObject = {
					line: function line() {
						return new fabric.Line([startX - strokeWidth / 2, startY - strokeWidth / 2, endX - strokeWidth / 2, endY - strokeWidth / 2], {
							stroke: strokeColor,
							strokeWidth: strokeWidth,
							radius: 90,
							strokeLineCap: 'round',
							id: new Date().getTime()
						});
					},
					circle: function circle() {
						var radius = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
						return new fabric.Circle({
							top: startY - radius - strokeWidth / 2,
							left: startX - radius - strokeWidth / 2,
							radius: radius,
							fill: '',
							stroke: strokeColor,
							strokeWidth: strokeWidth
						});
					},
					square: function square() {
						return new fabric.Rect({
							width: Math.abs(endX - startX),
							height: Math.abs(endY - startY),
							top: startY <= endY ? startY - strokeWidth / 2 : endY - strokeWidth / 2,
							left: startX <= endX ? startX - strokeWidth / 2 : endX - strokeWidth / 2,
							fill: '',
							stroke: strokeColor,
							strokeLineJoin: 'round',
							strokeWidth: strokeWidth
						});
					}
				};
				this.canvas.add(o === undefined ? createObject[type]() : o);
			}
	}

	/**
  * 撤销操作
  */
	function undo() {}

	/**
  * 恢复操作
  */
	function redo() {}

	/**
  * 
  * 暴露setting接口
  * @param {Object} o
  *o[Object]  => 以对象的方式设置instance
  */
	function set(o) {
		this.setting = o;
	}
	//  配置初始化函数

	WhiteBoard.prototype.init = init;

	WhiteBoard.prototype.version = version;

	WhiteBoard.prototype.render = render;

	WhiteBoard.prototype.undo = undo;

	WhiteBoard.prototype.redo = redo;

	WhiteBoard.prototype.set = set;

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
		eraser: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAUCAYAAAB1aeb6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKTWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/sl0p8zAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAJBSURBVHjapNbfS1NhGAfwx7ZGG/4LA3nw4mi70KsIYhfzkBFhsUnh1sXpRgbOXdVyCw2PrcYp6EJzwXLbRe8bk0kXEbimEHihNTxZFCOQsU1Jha6Hnay3izSa6HZ+HHjhnPd9v3zgfXne97QwxkDv82Kod1ycX29XNKUs0H5hbD33ZOBui158MdITHcyU2wDAqyNOe6V87oQeeOnR5UhAPwwAACbryd+a8ULCFxyMfz6tGIAtTkmZvGh/rgmvLET6bsdWzhiBAQVKpy8NAQCY1Wa25BnHneHMtYoh2E3jyfBot9VcU41/W820xUL3w8uKAdjipFIy9vC83VQ66Gq67DvVxdapUCT6umwABqQCnX7psZvW/u9tir8KByYzhmALdUrJpdFua/bwSEM8H+6JPlhRLEbgrltzH1Me+9OjRo/F30p9keCsoVqmKNDSnL9TOm7CkSfch+T1gDe6fFbRh3r3azldTHluNJzJGKtrpTcjV1yIBJEnorx79fB4oyaL/AQiMuRFItd+2JrNr/vYWUs6fBwSRI4I2apfC1xIeIMcIkH+JslVf6KazL+XjfcUh10H8IYmePXZwF+YE0i2utelNgeMMdgq51tHXEgQkfCiPKEFrt+mWr+WLDDGYMbHpRCRcUI2pSW8WUjo3ibGGMDXWb+AiAR5kcm1XZva4HZlYX+1OOKOfwlphRljYD5lM+8BAEApDf2OdELHJdWwlhve6Y/Ju08dm/nOfPH79i+Nv0Md7qni/L1z43rPvz8DAIWvfrkisI81AAAAAElFTkSuQmCC),auto'
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