var mapData;

var currentSettings = {
  mode: "split",
  isDragging: false,
  splits: 1
}

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
    let description = ' data-category="' + data[i].description + '"';

    let mapHTML = '<div class="grid-item"' + title + number + category + '><img src="' + img + '"/></div>';
    $('.grid').append(mapHTML);
  }

  // set up grid
  $('.grid').imagesLoaded( function() {
    console.log("images loaded");
    $('.grid').isotope({
      // options...
      itemSelector: '.grid-item',
      percentPosition: true,
      cellsByRow: {
        columnWidth: '.grid-sizer',
        rowHeight: '.grid-sizer'
      }
    });
  });
}

function showPopup(properties) {

  let index = parseInt(properties.number) - 1;

  let title = '<h2>' + properties.title + '</h2>';
  let number = '<h1>' + properties.number + '</h1>';

  let description = '<p>' + mapData[index].description + '</p>';
  let image = '<img src="img/' + mapData[index].img + '"/>';

  var randomTop = 0, randomLeft = 0;

  if ($('.popup').length > 0) {
    $('.popup').removeClass('latest');
    randomTop = Math.floor(Math.random() * 150) - 75;
    randomLeft = Math.floor(Math.random() * 150) - 75;
  }

  let offsetLeft = $(window).width()/2 + randomLeft;
  let offsetTop = $(window).height()/2 + randomTop;

  $('body').append('<div class="popup latest">' + number + title + image + description + '</div>');
  $('.latest').css('top',offsetTop + 'px').css('left', offsetLeft+'px');
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
        $('.grid').css('opacity',"0.2");
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
  let elem = $(this);
  dragElement(e, elem);
})

function dragElement(e, element) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  e = e || window.event;
  // get the mouse cursor position at startup:
  pos3 = e.clientX;
  pos4 = e.clientY;
  document.onmouseup = closeDragElement;
  // call a function whenever the cursor moves:
  document.onmousemove = elementDrag;

  function elementDrag(e) {
    currentSettings.isDragging = true;
    element.attr("id","dragging");

    e = e || window.event;
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    let elem = document.getElementById("dragging");
    elem.style.top = (elem.offsetTop - pos2) + "px";
    elem.style.left = (elem.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    $('#dragging').attr("id", null);

    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;

    setTimeout(function() {
      currentSettings.isDragging = false;
    },100);
  }
}
