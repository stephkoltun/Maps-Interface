var mapData;

var currentSettings = {
  mode: "popup",
  isDragging: false,
  groups: 0,
  groupColors: ["#1663e0","#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
  "#0000A6", "#63FFAC", "#004D43", "#8FB0FF","#5A0007", "#809693", "#1B4400", "#4FC601", "#3B5DFF", "#FF2F80"]
}

function showPopup(properties) {

  let index = parseInt(properties.number) - 1;

  let title = '<h2>' + properties.title + '</h2>';
  let number = '<h1>' + properties.number + '</h1>';

  let description = '<p>' + mapData[index].description + '</p>';
  let image = '<img src="img/' + mapData[index].img + '"/>';

  var randomTop = 0, randomLeft = 0;

  if ($('.popup').length > 0) {
    $('.popup').removeClass('active');
    randomTop = Math.floor(Math.random() * 150) - 75;
    randomLeft = Math.floor(Math.random() * 150) - 75;
  }

  let offsetLeft = $(window).width()/2 + randomLeft;
  let offsetTop = $(window).height()/2 + randomTop;

  $('body').append('<div class="popup active">' + title + image + description + '</div>');
  $('.active').css({"top": offsetTop + 'px', "left": offsetLeft+'px', "z-index": 20*$('.popup').length});
}


function splitScreen(properties) {
  let panes = currentSettings.splits;
  if (currentSettings.splits == 2) {
    currentSettings.splitChoice = Math.round(Math.random());
  }
  let index = parseInt(properties.number) - 1;
  let map = mapData[index];

  let options = [
    {
      2: {
        'gridwrapper': {"width": "60%", "height": "inherit", "display": "inline-block", "float": "left"},
        'gridsizer': {'width': '31%', 'height': "250px"},
        'secondwrapper': {"width": "40%", "height": "100vh", "float": "left"}
      },
      3: {
          'gridwrapper': {"width": "50%"},
          'secondwrapper': {"width": "50%", "height": "40vh"},
          'thirdwrapper': {"width": "50%", "height": "60vh", "float": "left"},
      },
    },
    {
      2: {
        'gridwrapper': {"height": "50vh", "width": "100%", "z-index": "1"},
        'gridsizer': {'width': '20%', 'height': "250px"},
        'secondwrapper': {"width": "100%", "height": "50vh", "z-index": "100"}
      },
      3: {
        'gridwrapper': {"height": "50vh", "width": "100%"},
        'secondwrapper': {"width": "50%", "height": "50vh", "float": "left"},
        'thirdwrapper': {"width": "50%", "height": "50vh", "float": "left", "z-index": "100"}
      }
    }
  ];

  let choice = options[currentSettings.splitChoice];

  switch (panes) {
    case 2:
      $('.grid-wrapper').css(choice[2].gridwrapper);
      $('.grid').isotope('layout');
      $('.grid-sizer, .grid-item').css(choice[2].gridsizer);
      $('.grid').isotope('layout');

      $('.grid-item img').css({'border-bottom': '3px solid #000', 'border-right': '3px solid #000'});


      let second = createPane('second', map);
      $('body').append(second);
      $('.second-wrapper').css(choice[2].secondwrapper);

      $('.grid').isotope('layout');
      break;
    case 3:
      $('.grid-wrapper').css(choice[3].gridwrapper);
      $('.grid').isotope('layout');

      let third = createPane('third', map);
      $('body').append(third);
      $('.second-wrapper').css(choice[3].secondwrapper);
      $('.third-wrapper').css(choice[3].thirdwrapper);
      break;
  }
}

function createPane(classname, map) {

  let title = '<h2>' + map.title + '</h2>';
  let number = '<h1>' + map.id + '</h1>';

  let description = '<p>' + map.description + '</p>';
  let image = '<img src="img/' + map.img + '"/>';

  let element = '<div class="pane ' + classname + '-wrapper"><div class="' +  classname + '">' + number + title + image + description + '</div></div>';

  return element
}

$('.grid').on('click', '.grid-item', function() {
  switch (currentSettings.mode) {
    case "popup":
      if ($('.popup').length == 0) {
        $('.grid').css('opacity',0.2);
      }
      showPopup($(this)[0].dataset);
      break;
    case "split":
      currentSettings.splits++;
      splitScreen($(this)[0].dataset);
      break;
    default:
      console.log("default");
      break;
  }
});

$('body').on('click', '.popup', function() {
  if (!currentSettings.isDragging) {
    $(this).remove();
    if ($('.popup').length == 0) {
      $('.grid').css('opacity',"1");
    }
  }
})


$('body').on('mousedown', '.popup', function(e) {
  $('.popup').removeClass('active');

  let elem = $(this);
  elem.css("z-index", $('.popup').length * 20);
  elem.addClass('active');

  dragElement(e, elem);
})

function dragElement(e, element) {
  var currentX = 0, currentY = 0, previousX = 0, previousY = 0;
  e = e || window.event;
  // get the mouse cursor position at startup:
  previousX = e.clientX;
  previousY = e.clientY;
  document.onmouseup = stopDraggingElement;
  // call a function whenever the cursor moves:
  document.onmousemove = elementDrag;

  function elementDrag(e) {
    currentSettings.isDragging = true;
    element.attr("id","dragging");

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

    // check if element is overtop of another one
    let elementsBelow = document.elementsFromPoint(e.clientX, e.clientY)
    let otherPopups = elementsBelow.filter(function(popup) {
      return (popup.className == "popup"? true : false);
    });
    console.log(otherPopups);

    if (otherPopups.length > 0) {
      element.css("border-color", currentSettings.groupColors[currentSettings.groups]);
      element.removeClass("active");

      console.log(otherPopups[0].offsetTop);
      let offset = 20;
      let yDifference = otherPopups[0].offsetHeight - element.outerHeight();
      let yPosition = otherPopups[0].offsetTop - yDifference/2 + offset;
      let xDifference = otherPopups[0].offsetWidth - element.outerWidth();
      let xPosition = otherPopups[0].offsetLeft - xDifference/2 + offset;
      element.css({"top": yPosition + "px", "left": xPosition + "px"});

      // need to put a group wrapper around these?
      for (let popup of otherPopups) {
        popup.style["border-color"] = currentSettings.groupColors[currentSettings.groups];
      }
    }

    $('#dragging').attr("id", null);

    setTimeout(function() {
      currentSettings.isDragging = false;
    },100);
  }
}

$(document).keydown(function(e) {
    switch(e.which) {

        case 38: // up
          currentSettings.groups++;
        break;


        case 40: // down
        currentSettings.groups--;
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
