function saveWorkspace(e) {
  workspace.metadata.lastEdited = new Date();
  workspace.metadata.title = $("#title").val();
  workspace.metadata.description = $("#desc").val();
  var workspaceData = {
    metadata: JSON.parse(JSON.stringify(workspace.metadata)),
    width: $(window).width(),
    height: $(window).height(),
    maps: [],
    groups: []
  };

  console.log(workspace.groups);

  for (var map in workspace.maps) {
    let tempObj = {
      metadata: workspace.maps[map].metadata,
      x: workspace.maps[map].x,
      y: workspace.maps[map].y,
    };

    workspaceData.maps.push(tempObj);
  };

  for (var group in workspace.groups) {
    let tempGroup = {
      color: workspace.groups[group].color,
      expanded: workspace.groups[group].expanded,
      x: workspace.groups[group].x,
      y: workspace.groups[group].y,
      maps: []
    }

    for (var map in workspace.groups[group].maps) {
      let temp = workspace.groups[group].maps;
      let tempMap  = {
        metadata: temp[map].metadata,
        x: temp[map].x,
        y: temp[map].y,
        grouped: temp[map].grouped,
      }

      tempGroup.maps.push(tempMap);
    }

    workspaceData.groups.push(tempGroup);
  }

  console.log(workspaceData);


  //is it a new or existing workspace?
  $.ajax({
      url: "http://localhost:8000/saveWorkspace",
      method: 'POST',
      data: JSON.parse(JSON.stringify(workspaceData)),
      //dataType: 'json',
      success: function(response) {
          console.log(response);
          workspace.addWorkspaceToList(workspaceData.metadata.title);
      },
      error: function(err) {
          console.log(err);
      }
  });
}
