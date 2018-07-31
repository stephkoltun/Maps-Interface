function roundToGrid(num) {
  return Math.ceil((num+1) / 25) * 25;
}

function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function SVGimage(url) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  el.setAttributeNS('http://www.w3.org/1999/xlink','href', url);

  return el;
}

function parseTransform(el) {
  var b={};
  var transform = $(el).attr("transform");
    for (var i in transform = transform.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
    {
        var c = transform[i].match(/[\w\.\-]+/g);
        b[c.shift()] = c;
    }
    return b;
}

$(document).on("click", "svg#linespace", function(e) {

  if ($("#info-panel").length >0) {
    $("#info-panel").remove();
  }

  if ($(".activeInfo").length > 0) {
    let prevLeft = $(".activeInfo").offset().left;
    $(".activeInfo").offset({left: prevLeft+2 });
    $(".activeInfo").removeClass("activeInfo");
  }
})
