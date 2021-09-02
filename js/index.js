const app = {
  init() {
    this.createLayout()
    this.eventListener()
  },
  data: {
    size: 15,
    whiteMove: true,
    exist: null
  },
  // 判断输赢
  jurge(x, y, type) {
    console.log('x, y', x, y)
    console.log('data', this.data.exist)
    // 1. 获取当前下的棋子的x,y坐标，并基于此进行如下判断：
    // 2. 判断横向是否有5连
    // 3. 判断竖向是否有5连
    // 4. 判断/向是否有5连
    // 5. 判断\向是否有5连

    let result = {
      row: false,
      col: false,
      slant: false
    }

    result.row = rowJurge(this.data.exist[y], x)
    result.col = colJurge(generateYarr(this), y)

    // 横向判断
    function rowJurge(xArr, x) {
      let r = false
      if (x === 0) { // 当前棋子处于最左侧
        if (xArr[x] === xArr[1] &&
          xArr[x] === xArr[2] &&
          xArr[x] === xArr[3] &&
          xArr[x]=== xArr[4]) {
          r = true
        }
      } else if (x === 14) { // 当前棋子处于最右侧
        if (xArr[x] === xArr[13] &&
          xArr[x] === xArr[12] &&
          xArr[x] === xArr[11] &&
          xArr[x] === xArr[10]) {
          r = true
        }
      } else { // 当前棋子处于中间（非左右两端）
      }
      return r
    }
    function generateYarr(that) {
      let yArr = []
      for (let i = 0; i < 15; i++) {
        yArr.push(that.data.exist[i][x])
      }
      return yArr
    }
    // 竖向判断
    function colJurge(yArr, y) {
      let r = false
      if (y === 0) { // 当前棋子处于最顶侧
        if (yArr[y] === yArr[1] &&
          yArr[y] === yArr[2] &&
          yArr[y] === yArr[3] &&
          yArr[y]=== yArr[4]) {
          r = true
        }
      } else if (y === 14) { // 当前棋子处于最底侧
        if (yArr[14] === yArr[13] &&
          yArr[14] === yArr[12] &&
          yArr[14] === yArr[11] &&
          yArr[14] === yArr[10]) {
          r = true
        }
      } else { // 当前棋子处于中间（非上下两端）
      }
      return r
    }
    // 斜向判断
    function slantJurge() {
    }
    console.log('gameover', result, type)
    if (result.row || result.col || result.slant) {
      document.getElementsByClassName('who-win')[0].innerText = type === 0 ? '白方胜' : '黑方胜'
    }
  },
  // 点击下棋事件监听
  eventListener() {
    document.getElementById('gobang').addEventListener('click', e => {
      const { nodeName, className, dataset } = e.target
      if (nodeName === 'TD' && className.includes('layout-box')) {
        if (!className.includes('used')) { // 此位置未有棋子
          let [x, y] = dataset.index.split('-')
          x = Number(x)
          y = Number(y)
          // 添加棋子节点
          let point = null
          if (this.data.whiteMove) {
            point = new Point({ x: x, y: y, color: '#fff' })
            e.target.classList.add('white-used')
            record(this, 0)
            this.data.whiteMove = false
            document.getElementsByClassName('player')[0].innerText = '黑'
          } else {
            point = new Point({ x: x, y: y, color: '#000' })
            e.target.classList.add('bk-used')
            record(this, 1)
            this.data.whiteMove = true
            document.getElementsByClassName('player')[0].innerText = '白'
          }
          point.put()

          // 记录已下棋子的数据，type为0：代表白方，为1：代表黑方
          function record(that, type) {
            that.data.exist[15 - y][x - 1] = type
            that.jurge(x - 1, 15 - y, type)
          }
        }
      }
    })
  },
  // 创建棋盘
  createLayout() {
    const layout = new Layout({ size: this.data.size })
    const dom = layout.generate()
    document.getElementById('gobang').innerHTML = dom
    this.data.exist = layout.getData()
  }
}

// 棋子
class Point {
  constructor({ x, y, color }) {
    this.x = x
    this.y = y
    this.color = color
  }
  put() {
    let left = ((this.x - 1) * 40 - 15) + 'px'
    let bottom = ((this.y - 1) * 40 - 15) + 'px'
    let color = this.color
    const point = `<span class="point" style="left: ${left};bottom: ${bottom};background-color: ${color};"></span>`
    document.getElementsByClassName('point-container')[0].innerHTML += point
    // 给最后一次下的棋子增加红十字标识符
    this.addAnchor(left, bottom)
  }
  addAnchor(left, bottom) {
    if (document.getElementsByClassName('anchor').length === 0) {
      const anchor = `<span class="anchor" style="left: ${left};bottom: ${bottom};">+</span>`
      document.getElementsByClassName('point-container')[0].innerHTML += anchor
    } else {
      document.getElementsByClassName('anchor')[0].style.left = left
      document.getElementsByClassName('anchor')[0].style.bottom = bottom
    }
  }
}

// 棋盘布局类
class Layout {
  constructor({ size }) {
    this.size = size
  }
  // 获取棋盘初始数据，以二维数组描述棋盘   [[...''], [...''], ...[...'']]
  getData() {
    let row = 0
    let arr = []
    while(row < this.size) {
      arr.push(new Array(this.size))
      row++
    }
    return arr
  }
  // 生成棋盘dom
  generate() {
    const layoutDom = generateRow(this.size)
    return `<table>
      <tbody>${layoutDom}</tbody>
      <tfoot class="point-container"></tfoot>
    </table>`

    // 创建横向棋盘
    function generateRow(size) {
      let dom = ''
      for (let y = size; y > 0; y--) {
        let r = ''
        if (y === size) { // 第一排
          let rowClass = 'layout-box-top'
          r = generateCol(y, size, rowClass)
        } else if (y === 1) { // 最后一排
          let rowClass = 'layout-box-bottom'
          r = generateCol(y, size, rowClass)
        } else { // 中间排
          r = generateCol(y, size)
        }
        dom += `<tr>${r}</tr>`
      }
      return dom
    }
    // 创建竖向棋盘
    function generateCol(y, size, rowClass = '') {
      let dom = ''
      for (let x = 1; x <= size; x++) {
        if (x === 1) { // 第一列
          const colClass = 'layout-box-left'
          dom += `<td class="layout-box ${rowClass} ${colClass}" data-index="${x}-${y}"></td>`
        } else if (x === size) { // 最后一列
          const colClass = 'layout-box-right'
          dom += `<td class="layout-box ${rowClass} ${colClass}" data-index="${x}-${y}"></td>`
        } else { // 中间列
          let content = ''
          if (x === 4 && y === 12 ||
            x === 12 && y === 12 ||
            x === 4 && y === 4 ||
            x === 12 && y === 4 ||
            x === 8 && y === 8) {
              content = '◼'
            }
          dom += `<td class="layout-box ${content ? 'layout-box-point' : ''} ${rowClass}" data-index="${x}-${y}">${content}</td>`
        }
      }
      return dom
    }
  }
}

app.init()