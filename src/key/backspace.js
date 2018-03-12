let BackSpace = function() {
  let p = this.data[this.lineIndex];
  this.data.splice(this.lineIndex, 1);
  let lastP = this.data[this.lineIndex - 1];
  this.childIndex = lastP.child.length;
  p.child.map(child => {
    lastP.ele.appendChild(child.ele);
    lastP.child.push(child);
  });
  p.ele.parentNode.removeChild(p.ele);
  this.lineIndex = this.lineIndex - 1;

  this.data[this.lineIndex].child[this.childIndex].input.focus();
}

module.exports = BackSpace;