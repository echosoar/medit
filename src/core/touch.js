/**
 * Medit Touch
 */

class Touch {
  constructor(box, config) {
    this.isPrevent = false;
    this.config = config || {};
    this.buffer = this.config.buffer || 10;
    box.addEventListener('touchstart', this.touchStart.bind(this));
    box.addEventListener('touchend', this.touchEnd.bind(this));
    box.addEventListener('touchmove', this.touchMove.bind(this));
  }

  setPrevent(prevent) {
    this.isPrevent = prevent;
  }

  _prevent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  touchStart(e) {
    
    this.posi = {
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY,
      endX: e.touches[0].pageX,
      endY: e.touches[0].pageY,
      verticalDistance: 0,
      horizontalDistance: 0,
      target: e.target
    };
  }

  touchMove(e) {
    this.posi.endX = e.touches[0].pageX;
    this.posi.endY = e.touches[0].pageY;
    this.posi.horizontalDistance = this.posi.endX - this.posi.startX;
    this.posi.horizontal = this.posi.horizontalDistance > 0 ? 'right' : 'left';
    this.posi.verticalDistance = this.posi.endY - this.posi.startY;
    this.posi.vertical = this.posi.verticalDistance > 0 ? 'bottom' : 'top';
    this.config.move && this.config.move(this.posi);
  }

  touchEnd(e) {
    if (Math.abs(this.posi.verticalDistance) < this.buffer && Math.abs(this.posi.horizontalDistance) < this.buffer) {
      this.config.click && this.config.click(this.posi);
    } else {
      this._prevent(e);
      this.config.moveEnd && this.config.moveEnd(this.posi);
    }
  }
};


module.exports = Touch;