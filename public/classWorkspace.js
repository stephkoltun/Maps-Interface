var workspace;

class Workspace {
  constructor() {
    this.metadata = {
      title: null,
      description: null,
      lastEdited: null,
    }

    this.id = null;
    this.height = null;
    this.width = null;

    this.contains = [];
    this.colorCounter = 0;
  }

  populate() {
    if (this.maps != null) {
      for (var i = 0; i < this.maps.length; i++) {
        let tempMap = this.maps[i];
        let tempX = parseInt(tempMap.x.replace("px",""));
        let tempY = parseInt(tempMap.y.replace("px",""));
        let createdMap = new WorkspaceMap(tempMap.metadata, tempX, tempY, false);

        this.maps[i] = createdMap;
      }
    }

    if (this.groups != null) {
      for (var i = 0; i < this.groups.length; i++) {
        let tempGroup = this.groups[i];
        let tX = parseInt(tempGroup.x);
        let tY = parseInt(tempGroup.y);

        let first = tempGroup.maps[0];
        let firstX = parseInt(first.x.replace("px",""));
        let firstY = parseInt(first.y.replace("px",""));
        let firstMap = new WorkspaceMap(first.metadata, firstX, firstY, false);

        let second = tempGroup.maps[1];
        let secondX = parseInt(second.x.replace("px",""));
        let secondY = parseInt(second.y.replace("px",""));
        let secondMap = new WorkspaceMap(second.metadata, secondX, secondY, false);

        let createdGroup = new Group(tempGroup.color, firstMap, secondMap, tX, tY);
        firstMap.removeFromArray();
        secondMap.removeFromArray();

        if (tempGroup.maps.length > 2) {
          for (var k = 2; k < tempGroup.maps.length; k++) {
            let add = tempGroup.maps[k];
            let x = parseInt(add.x.replace("px",""));
            let y = parseInt(add.y.replace("px",""));
            let addedMap = new WorkspaceMap(add.metadata, x, y, false);

            createdGroup.addMap(addedMap);
            addedMap.removeFromArray();
          }
        }
        this.groups[i] = createdGroup;
      }
    }

    $("#title").val(this.metadata.title);
    $("#desc").val(this.metadata.description);
  }

  clearItems() {
    $(".workspace-group").remove();
    $(".workspace-item").remove();
    $(".grip").remove();
    $(".link").remove();
  }

  addWorkspaceToList(title) {
    $("#existing-workspaces").append("<li>" + title + "</li>")
  }

  update(newSpace) {
    this.metadata = newSpace.metadata;
    this.maps = newSpace.maps;
    this.groups = newSpace.groups;
    this.prevHeight = newSpace.height;
    this.prevWidth = newSpace.width;

    this.id = newSpace._id;

    this.clearItems();
    this.populate();
  }
}
