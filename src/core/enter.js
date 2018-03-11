/**
   * 在input中按回车键的时候
   * 1. 如果在当前段落最后，则在此段落之后创建新的空段落
   * 2. 如果在当前段落中间，那么先对span进行分割，创建一个同样的，内容进行分割，并把后面的所有元素扔进下一个段落
   *  - 如果当前输入框为空，那么只处理后面的元素
   */
let Enter = function() {
  let { data, lineIndex, childIndex, _Selection: Selection } = this;
  console.log(lineIndex, childIndex, Selection)

  let nowEle =  data[lineIndex].child[childIndex].ele;
  let caretPos = Selection.getCaretPos(nowEle);
  let textLen = nowEle.innerText.length;

  if (childIndex == data[lineIndex].child.length - 1 && caretPos == textLen) {
    this.initLine(lineIndex + 1);
    this.childIndex = 0;
    this.insertNewSpan();
  } else {

    let toNextChildIndex = childIndex + 1;
    
    if (caretPos != textLen) {
      let text = nowEle.innerText;
      let preSpanText = text.substring(0, caretPos);
      let nextSpanText = text.substring(caretPos, textLen);
      let cloneNode = nowEle.cloneNode();
      let cloneNodeIndex = ++this.eleIndex;
      cloneNode.innerText = preSpanText;
      cloneNode.setAttribute('data-meditIndex', cloneNodeIndex);
      nowEle.innerText = nextSpanText;
      nowEle.parentNode.insertBefore(cloneNode, nowEle);
      this.data[lineIndex].child.splice(childIndex, 0, this.insertNewSpanInfo({ele: cloneNode, index: cloneNodeIndex}));

      toNextChildIndex = childIndex;
    } 

    this.initLine(lineIndex + 1);
    this.data[this.lineIndex].child = this.data[this.lineIndex - 1].child.splice(toNextChildIndex + 1);

    this.data[this.lineIndex].child.map(child => {
      child.ele.parentNode.removeChild(child.ele);
      this.data[this.lineIndex].ele.appendChild(child.ele);
    });

    this.data[this.lineIndex].child[0].input.focus();

  }

  console.log(this.data);
}
module.exports = Enter;