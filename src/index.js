const Touch = require('./core/touch');
const Input = require('./core/input');
const Utils = require('./core/utils');
const Selection = require('./core/selection');
const KeyDown = require('./key');

class Medit {
  constructor(box, toolBarBox) {
    if (!box) return;
    this.box = box;
    this.toolBarBox = toolBarBox;
    this.data = [];
    this.eleIndex = 0;
    this.lineIndex = 0;
    this.childIndex = 0;
    
    this.moveExecLength = 0; // 当前已经处理的移动光标长度
    this.moveSingleCharLen = 24;
    this.paragraphIndent = 4;
    this.paragraphLastIndent = 4;
    this.textIndent = 2;
    this.isSelecting = true;

    this.init();
    this.initLine();

    

    this.touch = new Touch(box, {
      click: this.handleClick.bind(this),
      move: this.handleTouchMove.bind(this),
      moveEnd: this.handleTouchEnd.bind(this)
    });
  }

  init() {
    this._Selection = Selection;

    this.container = document.createElement('div');
    this.container.setAttribute('class', 'medit-container');
    this.box.appendChild(this.container);
  }

  /**
   * 
   * insertIndex 代表在第几个位置插入新行
   */
  initLine(insertIndex) {
    let lineEle = document.createElement('p');
    let index = ++this.eleIndex;
    lineEle.setAttribute('data-meditIndex', index);
    lineEle.style.paddingLeft = this.paragraphIndent + 'em';
    lineEle.style.paddingRight = this.paragraphLastIndent + 'em';
    lineEle.style.textIndent = this.textIndent + 'em';
    if (insertIndex == null || insertIndex >= this.data.length) {
      this.container.appendChild(lineEle);
      this.data.push({ele: lineEle, child: [], index});
      this.lineIndex = this.data.length - 1;
    } else {
      let lastEle = this.data[insertIndex].ele;
      this.container.insertBefore(lineEle, lastEle);
      this.data.splice(insertIndex, 0, {ele: lineEle, child: [], index});
      this.lineIndex = insertIndex;
    }
  }

  handleClick(posi) {
    if (posi.target == this.box) {
      this.insertNewSpan(this.data[this.lineIndex].child);
    } else {
      let indexInfo = Utils.getIndex(this.data, posi.target);
      if (indexInfo) {
        this.lineIndex = indexInfo.lineIndex;
        this.childIndex = indexInfo.childIndex;
      }
    }
  }

  handleTouchMove(posi) {
    let nowEle =  this.data[this.lineIndex].child[this.childIndex].ele;
    let caretPos = Selection.getCaretPos(nowEle);
    let size = parseInt((posi.horizontalDistance - this.moveExecLength)/ this.moveSingleCharLen);

    if (!this.isSelecting) {
      if (Math.abs(size) >= 1) {
        this.moveExecLength = posi.horizontalDistance;
        let writeInfo = Selection.getElement(this.data, this.lineIndex, this.childIndex, size, caretPos);
        if (writeInfo) {
          if (this.lineIndex != writeInfo.lineIndex || this.childIndex != writeInfo.childIndex) {
            this.data[this.lineIndex].child[this.childIndex].input.blur();
            this.lineIndex = writeInfo.lineIndex;
            this.childIndex = writeInfo.childIndex;
            this.data[this.lineIndex].child[this.childIndex].input.focus();
          }
          Selection.setCaretPos(writeInfo.ele, writeInfo.pos);
        }
      }
    } else {
      if (Math.abs(size) >= 1) {
        if (this.selectingStartNode == null) {
          this.selectingStartNode = nowEle;
          this.selectingStartIndex = caretPos;
          this.selectingSelection = window.getSelection();
        }

        this.selectingStartRange = document.createRange();
        this.moveExecLength = posi.horizontalDistance;
        let writeInfo = Selection.getElement(this.data, this.lineIndex, this.childIndex, size, caretPos);

        if (writeInfo.lineIndex < this.lineIndex || 
          (writeInfo.lineIndex == this.lineIndex && writeInfo.childIndex < this.childIndex) ||
          (writeInfo.lineIndex == this.lineIndex && writeInfo.childIndex == this.childIndex && writeInfo.pos < this.selectingStartIndex)
        ) {
          this.selectingStartRange.setStart(writeInfo.ele.childNodes[0], writeInfo.pos);
          this.selectingStartRange.setEnd(this.selectingStartNode.childNodes[0], this.selectingStartIndex);
        } else {
          this.selectingStartRange.setStart(this.selectingStartNode.childNodes[0], this.selectingStartIndex);
          this.selectingStartRange.setEnd(writeInfo.ele.childNodes[0], writeInfo.pos);
        }

        this.selectingSelection.removeAllRanges();
        this.selectingSelection.addRange(this.selectingStartRange);
      }
  
      

      
      
    }
    
  }

  handleTouchEnd() {
    this.moveExecLength = 0;
    if (!this.isSelecting) {
      
    } else {
      this.selectingStartNode = null;
      this.selectingStartIndex = null;
      this.selectingStartRange = null;
    }
  }

  // 失去输入光标
  inputBlur() {

  }

  // 向最后插入新的一个span
  insertNewSpan(child) {
    let spanEle = this.initSpan(child);
    this.childIndex = this.data[this.lineIndex].child.length - 1;
    if (!spanEle.isOld) {
      this.childIndex ++;
      this.data[this.lineIndex].child.push(this.insertNewSpanInfo(spanEle));
      this.data[this.lineIndex].ele.appendChild(spanEle.ele);
      this.data[this.lineIndex].child[this.childIndex].input.focus();
    } else {
      this.data[this.lineIndex].child[this.childIndex].input.focus();
    }
  }


  insertNewSpanInfo(spanEle) {
    return {
      ele: spanEle.ele,
      input: new Input(spanEle.ele, {
        blur: this.inputBlur.bind(this),
        keydown: KeyDown.bind(this)
      }),
      index: spanEle.index
    };
  }

  initSpan(child) {
    if (child && child.length) {
      let ele = child[child.length - 1].ele;
      if (Utils.isNormalSpan(ele)) {
        return {
          isOld: true
        };
      }
    }
    let span = document.createElement('span');
    span.setAttribute('class', 'medit-span-text');
    let index = ++this.eleIndex;
    span.setAttribute('data-meditIndex', index);
    return {
      ele: span,
      index
    };
  }

  render() {

  }

  
}

if (!window.Medit) {
  window.medit = window.Medit = Medit;
}