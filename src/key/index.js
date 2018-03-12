const Enter = require('./enter')
const BackSpace = require('./backspace');

const key = function(e, inputCtx) {
  console.log( this.childIndex, this.lineIndex)
  if (e.key.toLowerCase() == 'enter') {
    e.preventDefault();
    e.stopPropagation();
    inputCtx.blur();
    Enter.call(this);
  } else if (e.key.toLowerCase() == 'backspace' && this.childIndex == 0 && this.lineIndex != 0) {
    let nowEle = this.data[this.lineIndex].child[this.childIndex].ele;
    let caretPos = this._Selection.getCaretPos(nowEle);
    if (caretPos == 0) {
      e.preventDefault();
      e.stopPropagation();
      inputCtx.blur();
      BackSpace.call(this);
    }
  }


}

module.exports = key;