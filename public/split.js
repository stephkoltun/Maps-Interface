var mapData;

var currentSettings = {
  mode: "split-single",
  isDragging: false,
  splits: 1,
  isSplit: false,
}



function splitSingle(properties) {
  let index = parseInt(properties.number) - 1;
  let map = mapData[index];

  $('.grid-item img').css({'border-bottom': '3px solid #000', 'border-right': '3px solid #000'});

  $('.grid-wrapper').css({"width": "40%", "height": "50vh", "display": "inline-block", "float": "left", "overflow": "scroll", "border-right": "3px solid #000", "border-bottom": "3px solid #000", "border-top": "6px solid #000", "border-left": "6px solid #000"});

  $('.grid-sizer, .grid-item').css({'width': '48%', 'height': "150px"});
  $('.grid').isotope('layout');

  let video = "<div class='vid'>" + map.video + "</div>";
  $('body').append(video);

  let post = "<div class='post'>" + "<h1>" + map.title + "</h1>" + map.post + "</div>"
  $('body').append(post);

  let images = "<div class='images'>";
  for (var i = 0; i < map.images.length; i++) {
    images += "<img src='img/" + map.images[i] + "'/>";
  }
  images += "</div>";
  $('body').append(images);

  let groups = "<div id='groups'><h2>Groups</h2></div>";
  $('body').append(groups);

  let w = $("#groups").width();

  let size = w/3*2;
  let padding = 10;

  for (var i = 0; i < map.groups.length; i++) {
    let group = "<div class='grp' style='height:" + (size + padding*2*(map.groups[i].length+1)) + "px'>"

    for (var k = 0; k < map.groups[i].length; k++) {
      let offset = (k)*padding;
      let groupitem = "<div class='group-item' style='height:" + size + "px;top:" + offset*2 + "px;left:" + offset + "px'></div>";
      group += groupitem
    }
    group += "</div>"
    $('#groups').append(group);
  }
}

$('.grid').on('click', '.grid-item', function() {
  switch (currentSettings.mode) {
    case "split-single":
      if (currentSettings.isSplit) {
        $('.post').remove();
        $('.images').remove();
        $('.vid').remove();
        $('#groups').remove();
      }
      $('.grid-item').css('opacity', .5);
      $(this).css('opacity', 1);
      splitSingle($(this)[0].dataset);
      currentSettings.isSplit = true;
      break;
    default:
      console.log("default");
      break;
  }
});
