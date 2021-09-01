const app = {
  init() {
    this.createLayout()
    this.eventListener()
  },
  data: {
    size: 15,
    whiteMove: true,
    rangeX: [8, 8],
    rangeY: [8, 8],
    whiteExist: {},
    bkExist: {}
  },
  // 判断输赢
  jurge(x, y, isWhite) {
    console.log('x, y', x, y)
    const whiteArr = document.getElementsByClassName('white-used')
    const bkArr = document.getElementsByClassName('bk-used')
    // 1. 获取当前下的棋子的x,y坐标，并基于此进行如下判断：
    // 2. 判断横向是否有5连
    // 3. 判断竖向是否有5连
    // 4. 判断/向是否有5连
    // 5. 判断\向是否有5连

    let exist = isWhite ? 'whiteExist' : 'bkExist'
    if (this.data[exist][y].length >= 5) {
      let result
      if (this.data[exist][y].indexOf(x - 4) !== -1) {
        result = isContinuous(this.data[exist][y], this.data[exist][y].indexOf(x - 4), 5)
      } else if (this.data[exist][y].lastIndexOf(x + 4) !== -1) {
        result = isContinuous(this.data[exist][y], this.data[exist][y].lastIndexOf(x), 5)
      }
      console.log('result', result)

      // 递归判断是否连续5次
      function isContinuous(arr, index, max) {
        if (index < (max - 1)) {
          if (arr[index] + 1 === arr[index + 1]) {
            isContinuous(arr, ++index, max)
          } else {
            return false
          }
        } else {
          console.log('rrrr')
          return true
        }
      }
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

          // 统计x和y坐标上存在棋子的最小和最大区间，用于优化实时计算结果的速度
          if (x < this.data.rangeX[0]) {
            this.data.rangeX[0] = x
          } else if (x > this.data.rangeX[1]) {
            this.data.rangeX[1] = x
          }
          if (y < this.data.rangeY[0]) {
            this.data.rangeY[0] = y
          } else if (y > this.data.rangeY[1]) {
            this.data.rangeY[1] = y
          }
          // document.getElementsByClassName('player')[0].innerText = `${this.data.rangeX}--${this.data.rangeY}`

          // 添加棋子节点
          let point = null
          if (this.data.whiteMove) {
            point = new Point({ x: x, y: y, color: '#fff' })
            e.target.classList.add('white-used')
            addExist(this, true)
            this.data.whiteMove = false
            document.getElementsByClassName('player')[0].innerText = '黑'
          } else {
            point = new Point({ x: x, y: y, color: '#000' })
            e.target.classList.add('bk-used')
            addExist(this, false)
            this.data.whiteMove = true
            document.getElementsByClassName('player')[0].innerText = '白'
          }
          point.put()

          function addExist(that, isWhite) {
            // 更新已下棋子的坐标记录，key为y坐标，value为数组，每个item则为x坐标
            let exist = isWhite ? 'whiteExist' : 'bkExist'
            if (!that.data[exist][y]) {
              that.data[exist][y] = [x]
            } else {
              that.data[exist][y].push(x)
              that.data[exist][y] = that.data[exist][y].sort((a, b) => a - b)
            }
            that.jurge(x, y, isWhite)
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