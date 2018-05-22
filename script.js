var mode = "popup";
var mapData;

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

// $('body').on('click', '.popup', function() {
//   $(this).remove();
//   if ($('.popup').length == 0) {
//     $('.grid').css('opacity',"1");
//   }
// })

$('.grid').on('click', '.grid-item', function() {
  if ($('.popup').length == 0) {
    $('.grid').css('opacity',"0.2");
  }
  showPopup($(this)[0].dataset);
});


$('body').on('mousedown', '.popup', function(e) {
  console.log("mousedown");

  $(this).attr("id","dragging");
  dragElement(e);

})


function dragElement(e) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  //$("body").on("mousedown", "#dragging", function(e) {
    e = e || window.event;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  //})

  function elementDrag(e) {
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
  }
}

// $('body').on('dragenter', '.popup', function(e) {
//   e.preventDefault()
//   console.log("dragenter");
// })
//
// $('body').on('drop', '.popup', function(e) {
//   e.preventDefault()
//   console.log("drop");
// })
