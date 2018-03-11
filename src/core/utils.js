var regNormalStyle = /(font\-style\s*:\s*normal\s*;)|(font\-weight\s*:\s*normal\s*;)|(color:\s*rgb\(0,\s*0,\s*0\);)|(\s*)/ig;


let Utils = {};

Utils.isNormalSpan = (ele) => {
  if (ele.nodeName.toLowerCase() != 'span') return false;
  let style = ele.getAttribute('style');
  return !style || !style.replace(regNormalStyle, '');
}

Utils.getIndex = (data, ele) => {
  if (!ele) return;
  let element = ele;
  let childIndexId = ele.getAttribute("data-meditIndex");
  while(element && element.nodeName.toLowerCase() != 'p') {
    element = element.parentNode;
  }
  if (!element) return;
  let lineIndexId = element.getAttribute("data-meditIndex");
  
  let lineIndex = 0;
  let childIndex = 0;
  for (let i = 0;i < data.length; i++) {
    if (data[i].index == lineIndexId) {
      lineIndex = i;
      break;
    }
  }

  let child = data[lineIndex].child;
  for (let j = 0;j < child.length; j++) {
    if (child[j].index == childIndexId) {
      childIndex = j;
      break;
    }
  }
  return {
    lineIndex,
    childIndex
  };
}


module.exports = Utils;