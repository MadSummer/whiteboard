const EventProxy = require('./eventproxy');
const doc = document;
const body = doc.body;
const defaultConfig = {
  width: 500,
  height: 375,
  type: 'pencil',
  undoMax: 10,
  fontSize: 16,
  lineWidth: 1,
  color: '#222',
  fillColor: 'rgba(0, 0, 0, 0)'
}

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
  startFreeDraw: function () {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.width = 2;
    this.canvas.freeDrawingBrush.shadowBlur = 0
  },
  methods: {
    undo: function (action) {
      this.data.undoArr.push(action)
    },
    redo: function (action) {
      this.data.redoArr.push(action)
    }
  },
  register: function () {
    this.ep.on('setting.change', this.methods.changeSetting);
    this.ep.on('undo', this.methods.undo);
    this.ep.on('redo', this.methods.redo);
    this.ep.on('add', this.methods.draw);
    //this.ep.on('remove',this.methods.) 
  },
  init: function (o) {
    //创建fabric canvas
    if (!this.check()) return;
    this.initFabric();
    this.ctx = this.canvas.upperCanvasEl.getContext('2d');
  },
  check: function () {
    if (!this.config.id) return this.throw('初始化参数不正确');
    let container = doc.querySelector(this.config.id);
    return container === null ? true : false;
  },
  initFabric: function (o) {
    let id = this.config.id;
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
  changeSetting: function (s) {
    for (let k in s) {
      this.settings[k] = s[k];
    }
  },
  draw: function (data) {

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
  throw: (msg) => {
    throw new Error(msg)
  }

}
window.Draw = Draw;