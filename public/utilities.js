function roundToGrid(num) {
  return Math.ceil((num+1) / 25) * 25;
}

function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
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
