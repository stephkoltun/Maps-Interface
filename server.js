// Internal Dependencies
let port = 8000;
let config = require('./config'); // make sure this is ignored by git

let express = require('express'),
    app = express();
let mongojs = require('mongojs');
let multer = require('multer');
let bodyParser = require('body-parser');

let db = mongojs(config.uri);
let mapCollection = db.collection("maps");


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.get('/refactor', function(request, response) {
  response.sendFile('public/refactor.html', {root: __dirname })
})

app.get('/data', function(request, response) {
  console.log("collect maps");
  mapCollection.find(function(err, maps) {
    if (err) {
      console.log(err);
    } else {
      console.log("received maps from DB");
      response.send(maps)
    }
  });
});


app.post('/saveWorkspace', function(request, response) {
  console.log(request.body);
})



// Start the app
app.listen(port, function() {
    console.log('Server listening on port ' + port)
});
