// get JSON data about maps
fetch('data.json')
  .then(function(response) {
    console.log(response);
    return response.json();
  })
  .then(function(jsonData) {
    console.log(jsonData);

    mapData = jsonData.maps;
    populateHTML(jsonData.maps);

  })
  .catch(function(error) {
    console.log('There has been a problem with your fetch operation: ', error.message);
  });

var bgColors = ["#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
"#0000A6", "#63FFAC", "#004D43", "#8FB0FF","#5A0007", "#809693", "#1B4400", "#4FC601"];

function populateHTML(data) {
  for (var i = 0; i < 11; i++) {
    var img = "img/";
    if (i < 9) {
      img += "00" + (i+1) + ".png";
    } else if (i < 99) {
      img += "0" + (i+1) + ".png";
    } else {
      img += i + ".png";
    }

    let title = ' data-title="'+ data[i].title + '"';
    let number = ' data-number="' + data[i].id + '"';
    let category = ' data-category="' + data[i].category + '"';
    let description = ' data-description="' + data[i].description + '"';

    let color = bgColors[i];

    $('<div/>', {
      "class": 'list-item',
      css: {
        "background-image": 'url("' + img + '")',
        // "background-color": color
      },
      "data-title": data[i].title,
      "data-number": data[i].id,
      "data-category": data[i].category,
    }).append("<h1>" + data[i].title + "</h1>").appendTo('#list');
  }

  // set up grid
  $('#list').imagesLoaded( function() {
    console.log("images loaded");
    $('#list').isotope({
      // options...
      itemSelector: '.list-item',
      percentPosition: true,
      layoutMode: 'vertical'
    });
  });
}

$('body').on('mousedown', '.list-item', function(e) {
  console.log('drag');

  var offset = 10

  var clicked = $(this);

  var copy = clicked.clone().appendTo('#workspace');
  copy.empty()
  copy.removeClass('list-item');
  copy.addClass("active");
  copy.css("top", clicked.offset().top + offset);
  copy.css("left", clicked.offset().left + offset);
  copy.attr("id","dragging");

  dragElement(e, copy);
})

$('body').on('mousedown', '.workspace-item', function(e) {

  let elem = $(this);
  elem.css("z-index", $('.workspace-item').length * 20);
  elem.attr("id", "dragging");
  elem.addClass("active");
  console.log("drag");

  dragElement(e, elem);
})

// $('body').on('click', '.workspace-item', function() {
//   if (!isDragging) {
//
//     if ($("#workspace-panel").length >0) {
//       $("#workspace-panel").remove();
//     }
//
//     var mapIndex = $(this)[0].dataset.number - 1;
//     var map = mapData[mapIndex]
//
//     var title = "<h1>" + map.title + "</h1>";
//     var meta = "<div class='metadata'><p class='cat'>" + map.category + "</p><p class='desc'>" + map.description + "</p></div>";
//     var post = "<div class='post'>" + map.post + "</div>";
//
//     var images = "<div class='images'><div id='image-inset'>";
//     for (var i = 0; i < map.images.length; i++) {
//       images += "<div class='image-item'><img src='img/" + map.images[i] + "'/></div>";
//     }
//     images += "</div></div>";
//
//     $('<div/>', {
//       "id": 'workspace-panel',
//     }).append(title + meta + post + images).appendTo('.workspace-wrapper');
//
//     $('#image-inset').imagesLoaded( function() {
//       console.log("images loaded");
//       $('#image-inset').isotope({
//         // options...
//         itemSelector: '.image-item',
//         percentPosition: true,
//         cellsByRow: {
//           columnWidth:'.image-sizer',
//           rowHeight: '.image-sizer'
//         }
//       });
//
//     });
//   }
// })

var isDragging = false;

function dragElement(e, element) {
  var currentX = 0, currentY = 0, previousX = 0, previousY = 0;
  e = e || window.event;
  // get the mouse cursor position at startup:
  previousX = e.clientX;
  previousY = e.clientY;
  // call a function whenever the cursor moves:
  document.onmousemove = elementDrag;
  // stop the dragging
  document.onmouseup = stopDraggingElement;


  function elementDrag(e) {
    isDragging = true;

    e = e || window.event;
    // calculate the new cursor position:
    currentX = previousX - e.clientX;
    currentY = previousY - e.clientY;
    previousX = e.clientX;
    previousY = e.clientY;
    // set the element's new position:
    let elem = document.getElementById("dragging");
    element.css({"top": (elem.offsetTop - currentY) + "px", "left": (elem.offsetLeft - currentX) + "px"});
  }

  function stopDraggingElement(e) {
    e = e || window.event;

    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;

    $('#dragging').toggleClass('active');
    if (!$('#dragging').hasClass('workspace-item')) {
      $('#dragging').addClass('workspace-item');
    }
    $('#dragging').css("background-color", "#acacac");
    $('#dragging').attr("id", null);

    // check if element is overtop of another one
    let elementsBelow = document.elementsFromPoint(e.clientX, e.clientY)
    let otherItems = elementsBelow.filter(function(item) {
      return (item.className == "workspace-item"? true : false);
    });

    if (otherItems.length > 0) {
      element.css("border-color", "#aa22dd");

      console.log(otherItems[0].offsetTop);
      let offset = 10;
      let yDifference = otherItems[0].offsetHeight - element.outerHeight();
      let yPosition = otherItems[0].offsetTop - yDifference/2 + offset;
      let xDifference = otherItems[0].offsetWidth - element.outerWidth();
      let xPosition = otherItems[0].offsetLeft - xDifference/2 + offset;
      element.css({"top": yPosition + "px", "left": xPosition + "px"});

      // need to put a group wrapper around these?
      for (let item of otherItems) {
        item.style["border-color"] = "#aa22dd";
      }
    }


    setTimeout(function() {
      isDragging = false;
    },100);
  }
}
