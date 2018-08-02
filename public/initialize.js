// Get map data from the database
$.ajax({
    //url: "http://localhost:8000/data",
    url: "http://localhost:8000/all",
    type: 'GET',
    //data: $('#placesForm').serialize(),
    dataType: 'json',
    success: function(data) {
        console.log("let's plot!");
        console.log(data);

        showAll(data.docs);
        //initializeWorkspace(data.maps, data.spaces);
    },
    error: function() {
        alert("error");
    }
});

function showAll(documents) {
  console.log("plot all generically");

  for (var i = 0; i < documents.length; i++) {
    var tempItem = new ListItem(documents[i]);
    listItems.push(tempItem);
  }

  workspace = new Workspace;

}


function initializeWorkspace(maps, spaces) {
  for (var i = 0; i < 11; i++) {
  // for (map in maps) {
    var tempMap = new ListMap(maps[i]);
    mapsList.push(tempMap);
  }

  for (space in spaces) {
    var tempSpace = spaces[space];

    $("#existing-workspaces").append('<li class="space-item" data-id=' + tempSpace._id + ' data-title="'+ tempSpace.metadata.title + '">' + tempSpace.metadata.title + '</li>');
  }

  workspace = new Workspace;

}

$(document).on("click", ".space-item", function() {

  let thisWorkspace = {
    id: $(this).data().id
  };

  $.ajax({
      url: "http://localhost:8000/workspace",
      type: 'POST',
      data: JSON.parse(JSON.stringify(thisWorkspace)),
      //data: JSON.stringify(thisWorkspace),
      dataType: 'json',
      success: function(newSpace) {
          console.log("received workspace");
          console.log(newSpace);
          workspace.update(newSpace);
      },
      error: function() {
          alert("error");
      }
  });
})


$("#workspaceToggle").click(function() {
  $("#workspaces").show();
  $("#list").hide();

  $(this).removeClass("unselected");
  $("#mapsToggle").addClass("unselected");
});

$("#mapsToggle").click(function() {

  $("#workspaces").hide();
  $("#list").show();

  $(this).removeClass("unselected");
  $("#workspaceToggle").addClass("unselected");
});
