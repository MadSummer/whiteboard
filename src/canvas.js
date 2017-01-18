const global = window;
const doc = document;
const body = doc.body;
const EventProxy = require('./eventproxy');
const defaultConfig = {
  id: '',
  fabric: {
    width: 500,
    height: 375,
    startX: 0,
    startY: 0,
    endx: 0,
    endY: 0,
  },
  setting: {
    undoMax: 10,
    type: 'pencil',
    fontSize: 16,
    lineWidth: 2,
    color: '#222',
    fillColor: 'rgba(0, 0, 0, 0)',
    isDrawingMode: true,
  }
}

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
    for (let k in o.fabric) {
      this.config.fabric[k] = o.fabric[k];
    }
  }
  if (o.setting instanceof Object) {
    for (let k in o.setting) {
      this.config.setting[k] = o.setting[k];
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
  let id = this.config.id;
  if (!id) return console.error('初始化参数不正确');
  let container = doc.getElementById(id);
  return container === null ? false : true;
}

/**
 * 初始化时监听的事件
 */
function listener(instance) {
  let self = instance;
  let canvasEvt = {
    'canvas:modified': 'canvasModified',
    'mouse:down': 'mousedown',
    'mouse:up': 'mouseup',
    'mouse:move': 'mousemove',
    'object:added': 'objectAdded',
    'object:modified': 'objectModified',
    'object:removed': 'objectRemoved'
  }
  for (let x in canvasEvt) {
    self.canvas.on(x, function (opt) {
      let handler = canvasEventHandler[canvasEvt[x]];
      if (!handler) return;
      handler.apply(self,[opt]);
    });
  }
  let instanceEvt = {
    'setting:modified': 'settingModified'
  }
  for (let x in instanceEvt) {
    self.ep.on(x, function (opt) {
      let handler = instanceEventHandler[instanceEvt[x]];
      if (!handler) return;
      handler(self,[opt]);
    });
  }
}

/**
 * 
 * 初始化fabric
 */
function initFabric() {
  let id = this.config.id;
  this.canvas = new fabric.Canvas(id, this.config.fabric);
  this.ctx = this.canvas.upperCanvasEl.getContext('2d');
  // 增加原型方法
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
  //增加原型方法
  fabric.Canvas.prototype.getLastItem = function () {
    let objects = this.getObjects();
    return objects[objects.length - 1];
  };
}


/**
 * 绘制函数
 */
function render(data) {
  let startX = this.canvas.startX;
  let startY = this.canvas.startY;
  let endx = this.canvas.endX;
  let endY = this.canvas.endY;
  let fillColor = this.data.fillColor;
  let strokeWidth = this.data.strokeWidth;
  let strokeColor = this.data.strokeColor;
  /**
   * 
   * 绘制线条
   * @param {any} data
   *线条数据，开始结束的位置
   */
  function line(data) {
    let line = new fabric.Line([data.startX - data.lineWidth / 2, data.startY - data.lineWidth / 2, data.endX - data.lineWidth / 2, data.endY - data.lineWidth / 2], {
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
    let circle = new fabric.Circle({
      top: data.startY - data.radius - data.lineWidth / 2,
      left: data.startX - data.radius - data.lineWidth / 2,
      radius: data.radius,
      fill: '',
      stroke: data.strokeColor,
      strokeWidth: data.strokeWidth
    })
    this.canvas.add(circle);
  }

  /**
   * 
   * 绘制方形
   * @param {any} data
   *起点，终点
   */
  function square(data) {
    let square = new fabric.Rect({
      width: Math.abs(data.endX - data.startX),
      height: Math.abs(data.endY - data.startY),
      top: data.startY <= data.endY ? data.startY - data.lineWidth / 2 : data.endY - data.lineWidth / 2,
      left: data.startX <= data.endX ? data.startX - data.lineWidth / 2 : data.endX - data.lineWidth / 2,
      fill: '',
      stroke: data.strokeColor,
      strokeWidth: data.strokeWidth,
    })
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
let instanceEventHandler = {
  settingModified: function (s) {
    for (let k in s) {
      this.config.setting[k] = s[k];
    }
  }
}
let canvasEventHandler = {
  canvasModified: function (s) {
    for (let k in s) {
      this[k] = s[k];
    }
  },
  mousedown: function (opt) {
    this.trigger('canvas:modified', {
      startX: opt.e.clientX - draw.canvas._offset.left,
      startY: opt.e.clientY - draw.canvas._offset.top
    });
  },
  mouseup: function (opt) {
    this.trigger('canvas:modified', {
      endX: opt.e.clientX - draw.canvas._offset.left,
      endY: opt.e.clientY - draw.canvas._offset.top
    });
  },
  objectAdded: function (o) {
    o.target.id = new Date().getTime() + Math.floor(Math.random() * 10);
  }
}

//  配置初始化函数
Draw.prototype.init = init;

Draw.prototype.render = render;

Draw.prototype.ep = new EventProxy();

global.Draw = Draw;