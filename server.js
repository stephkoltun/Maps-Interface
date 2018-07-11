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
let workspaceCollection = db.collection("workspaces");


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.get('/refactor', function(request, response) {
  response.sendFile('public/refactor.html', {root: __dirname })
})

app.get('/data', function(request, response) {
  console.log("collect maps and workspaces");
  mapCollection.find(function(err, maps) {
    if (err) {
      console.log(err);
    } else {

      workspaceCollection.find({}, {"metadata":true}, function(error, spaces) {
        if (error) {
          console.log(error);
        } else {
          console.log("received all maps and workspaces from DB");
          response.send({"maps":maps, "spaces":spaces});
        }
      })
    }
  });
});

app.post('/workspace', function(request, response) {
  console.log("find workspace " + request.body.id);

  workspaceCollection.findOne({_id: mongojs.ObjectId(request.body.id)}, function(error, space) {
      if (error) {
        console.log(error);
      } else {
        console.log("received workspace details");
        response.send(space);
      }
  })
})

app.post('/saveWorkspace', function(request, response) {
  console.log(request.body);
  workspaceCollection.insert(request.body, function(err, saved) {
    if (err || !saved) console.log("Not saved");
    else response.send("saved new workspace");
  });

})



// Start the app
app.listen(port, function() {
    console.log('Server listening on port ' + port)
});
