class Link {
  constructor(firstObject, color, elem) {
    this.color = color;
    this.type = "primary";
    this.startNode = firstObject;
    this.endNode = null;

    this.element = elem;
  }

  addEnd(obj) {
    this.endNode = obj;
  }

  moveStartBy(tempX, tempY) {
    let prevX = this.element.attr("x1");
    let newX = tempX + parseInt(prevX);
    this.element.attr("x1", newX);

    let prevY = this.element.attr("y1");
    let newY = tempY + parseInt(prevY);
    this.element.attr("y1", newY);
  }

  moveStartTo(tempX, tempY) {
    this.element.attr({
      "x1": tempX,
      "y1": tempY
    });
  }

  moveEndBy(tempX, tempY) {
    let prevX = this.element.attr("x2");
    let newX = tempX + parseInt(prevX);
    this.element.attr("x2", newX);

    let prevY = this.element.attr("y2");
    let newY = tempY + parseInt(prevY);
    this.element.attr("y2", newY);
  }
  moveEndTo(tempX, tempY) {
    this.element.attr({
      "x2": tempX,
      "y2": tempY
    });
  }
}
