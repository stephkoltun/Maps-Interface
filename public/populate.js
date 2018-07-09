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
