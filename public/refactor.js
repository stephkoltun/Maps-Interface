// Get map data from the database
$.ajax({
    url: "http://localhost:8000/data",
    type: 'GET',
    //data: $('#placesForm').serialize(),
    dataType: 'json',
    success: function(data) {
        console.log("let's plot!");
        console.log(data);

        for (var i = 0; i < 11; i++) {
          var map = new ListMap(data[i]);
          mapsList.push(map);
        }
    },
    error: function() {
        alert("error");
    }
});


// get JSON data about maps
// fetch('data.json')
//   .then(function(response) {
//     console.log(response);
//     return response.json();
//   })
//   .then(function(jsonData) {
//     console.log(jsonData);
//
//     mapData = jsonData.maps;
//
//     for (var i = 0; i < 11; i++) {
//       var map = new ListMap(jsonData.maps[i]);
//       mapsList.push(map);
//     }
//
//
//   })
//   .catch(function(error) {
//     console.log('There has been a problem with your fetch operation: ', error.message);
//   });
