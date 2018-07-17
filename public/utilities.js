function roundToGrid(num) {
  return Math.ceil((num+1) / 25) * 25;
}

function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}
