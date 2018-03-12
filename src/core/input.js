class Input {
  constructor(ele, config) {
    this.input = ele;
    this.config = config || {};
    this.input.onblur = this.blur.bind(this, true);
    this.input.onfocus = this.focus.bind(this, true);
    this.input.onkeydown = this.keydown.bind(this);
  }

  blur(skipBlur) {
    if (this.input.className.indexOf('medit-span-text-edit') != -1) {
      this.input.setAttribute('class', this.input.className.replace(' medit-span-text-edit', ''));
    }
    if (!skipBlur) {
      this.config.blur && this.config.blur();
      this.input.blur();
    }
  }

  focus(skipFocus) {
    this.input.setAttribute('contenteditable', true);
    
    if (this.input.className.indexOf('medit-span-text-edit') == -1) {
      this.input.setAttribute('class', this.input.className + ' medit-span-text-edit');
    }
    if (!skipFocus) {
      setTimeout(()=> {
        this.input.focus();
      }, 10);
    }
    
  }

  keydown(e) {
    this.config.keydown && this.config.keydown(e, this);
  }
}

module.exports = Input;