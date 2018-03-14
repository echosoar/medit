let Selection = {};

Selection.getCaretPos = (ele) => {
  var caretPos = 0,
  sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == ele) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == ele) {
      var tempEl = document.createElement("span");
      ele.insertBefore(tempEl, ele.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}

Selection.setCaretPos = (node, pos) => {
  var selection = window.getSelection();
  var range = document.createRange();
  range.selectNode(node);
  range.setStart(node.childNodes[0], 0);
  range.setEnd(node.childNodes[0], pos);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

// 获取从当前元素移动size后的元素位置
Selection.getElement = (data, lineIndex, childIndex, size, nowCaretPos, isSelect) => {
  let nowEleWidth = data[lineIndex].child[childIndex].ele.innerText.length;
  let moveWidth = size + nowCaretPos;
  console.log(moveWidth)
  if (moveWidth >= 0 && moveWidth <= nowEleWidth) {
    return {
      ele: data[lineIndex].child[childIndex].ele,
      lineIndex: lineIndex,
      childIndex: childIndex,
      pos: moveWidth
    };
  } else if (moveWidth < 0) { // 向前移动
    for (let l = lineIndex;l >= 0; l --) {
      let child = data[l].child;
      let end = child.length - 1;
      if (l == lineIndex) {
        end = childIndex - 1;
      }
      for (let c = end; c >= 0; c --) {
        let ele = child[c].ele;
        if (ele.className.indexOf('medit-span-text') != -1) {
          let nowTextWidth = ele.innerText.length;
          moveWidth += nowTextWidth;
          let pos = moveWidth + 1;
          if (isSelect) {
            pos = moveWidth;
          }
          if (moveWidth >= 0) {
            return {
              ele,
              lineIndex: l,
              childIndex: c,
              pos
            }
          }
        }
      }
    }
  } else { // 向后移动
    for (let l = lineIndex; l < data.length; l ++) {
      let child = data[l].child;
      let start = 0;
      if (l == lineIndex) {
        start = childIndex;
      }
      for (let c = start; c < child.length; c ++) {
        let ele = child[c].ele;
        if (ele.className.indexOf('medit-span-text') != -1) {
          let nowTextWidth = ele.innerText.length;
          let temMoveWidth = moveWidth - nowTextWidth;
          let pos = moveWidth - 1;
          if (isSelect) {
            pos = moveWidth;
          }
          if (temMoveWidth <= 0) {
            return {
              ele,
              lineIndex: l,
              childIndex: c,
              pos
            }
          } else {
            moveWidth -= nowTextWidth;
          }
        }
      }
    }
  }
}

module.exports = Selection;