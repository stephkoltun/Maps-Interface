var mapsList = [];

var workspace;

var bgColors = ["#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
"#0000A6", "#63FFAC", "#004D43", "#8FB0FF","#5A0007", "#809693", "#1B4400", "#4FC601"];

var tileSize = 100;

class WorkspaceMap {
  constructor(obj, tempX, tempY, drag) {
    this.metadata = {
      index: obj.index,
      title: obj.title,
      thumb: obj.thumb,
      description: obj.description,
      category: obj.category,
      post: obj.post,
      images: obj.images,
      video: obj.video,
      datasources: obj.datasources
    }

    this.x = tempX;
    this.y = tempY;

    this.dragging = drag;
    this.grouped = false;
    this.hoveredOver = null;

    // add it to the DOM
    this.element = this.createDOM();
    this.element.appendTo('#workspace');

    if (drag) {
      this.dragElement();
    }


    // make sure it's clickable
    this.element.on('mousedown', this.dragElement.bind(this)); // bind the whole object, rather than just the DOM element
    this.element.on('click', this.showInfo.bind(this));
  }

  createDOM() {
    return $('<div/>', {
      "css": {
        "left": this.x + "px",
        "top": this.y + "px",
        "background-image": 'url("img/' + this.metadata.thumb + '")',
      },
      "class": 'workspace-item',
      "data-title": this.metadata.title,
      "data-index": this.metadata.index,
      "data-category": this.metadata.category,
    });
  }

  checkBelow(x,y) {
    // check if element is overtop of another one
    let elementsBelow = document.elementsFromPoint(x, y)
    let mapsBelow = elementsBelow.filter(function(item) {
      return (item.className == "workspace-item"? true : false);
    });

    let groupsBelow = elementsBelow.filter(function(item) {
      return (item.className == "workspace-group"? true : false);
    });

    if (groupsBelow.length > 0) {
      var below = {
        match: "group",
        elems: groupsBelow
      }
      return below;
    } else if (mapsBelow.length > 0) {
      var below = {
        match: "map",
        elems: mapsBelow
      }
      return below;
    } else {
      return "none"
    }
  }

  dragElement() {

    if (!this.grouped) {
      this.element.attr("id","dragging");
      this.element.addClass("active");
      var currentX = 0, currentY = 0, previousX = 0, previousY = 0;
      var e = window.event;
      // get the mouse cursor position at startup:
      previousX = e.clientX;
      previousY = e.clientY;

      document.onmousemove = elementDrag.bind(this); // call a function whenever the cursor moves:
      document.onmouseup = stopDraggingElement.bind(this); // stop the dragging

      function elementDrag(e) {
        this.dragging = true;
        e = e || window.event;
        // calculate the new cursor position:
        currentX = previousX - e.clientX;
        currentY = previousY - e.clientY;
        previousX = e.clientX;
        previousY = e.clientY;
        // set the element's new position:
        let elem = document.getElementById("dragging");
        elem.style.top = (elem.offsetTop - currentY) + "px";
        elem.style.left = (elem.offsetLeft - currentX) + "px";

        let itemsBelow = this.checkBelow(e.clientX, e.clientY);

        if (itemsBelow.match == "group") {
          var index = parseInt(itemsBelow.elems[0].id);
          workspace.groups[index].showBackground();
          this.hoveredOver = workspace.groups[index];
        } else if (this.hoveredOver!= null && itemsBelow == "none") {
          this.hoveredOver.removeBackground();
          this.hoveredOver = null;
        }
      }

      function stopDraggingElement(e) {
        e = e || window.event;

        // stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;

        // snap to grid
        let elem = document.getElementById("dragging");
        let topRound = roundToGrid(elem.offsetTop - currentY);
        let leftRound = roundToGrid(elem.offsetLeft - currentX);
        elem.style.top = (topRound - 2) + "px";
        elem.style.left = (leftRound - 2) + "px";

        this.x = elem.style.left;
        this.y = elem.style.top;

        $('#dragging').removeClass('active');
        $('#dragging').attr("id", null);

        let itemsBelow = this.checkBelow(e.clientX, e.clientY);


        if (itemsBelow.match == "map") {

          var matchingMap;

          for (var i = 0; i < itemsBelow.elems.length; i++) {
            let id = (itemsBelow.elems[i].dataset.index).toString();

            if (id != this.metadata.index) {
              matchingMap = workspace.maps.filter(function(item) {
                return (item.metadata.index == id? true : false);
              });
            }
          }

          if (matchingMap != undefined) {
            console.log("create a new group");
            var x = matchingMap[0].element.offset().left;
            var y = matchingMap[0].element.offset().top;
            let group = new Group(bgColors[workspace.groups.length], this, matchingMap[0], x, y);
            this.grouped = true;
            matchingMap[0].grouped = true;
            workspace.groups.push(group);

            this.removeFromArray();
            matchingMap[0].removeFromArray();
          }
        } else if (itemsBelow.match == "group" && !this.grouped) {
          console.log("add to existing group!");

          var index = parseInt(itemsBelow.elems[0].id);
          workspace.groups[index].addMap(this);
          this.grouped = true;
          this.removeFromArray();
        }

        setTimeout(function() {
          this.dragging = false;
        },100);
      }
    }
  }

  removeFromArray() {
    var arrayIndex;
    for (var i = 0; i < workspace.maps.length; i++) {
      if (workspace.maps[i].metadata.index == this.metadata.index) {
        arrayIndex = i;
      }
    };
    workspace.maps.splice(arrayIndex, 1);
  }

  showInfo() {
    if ($("#workspace-panel").length >0) {
      $("#workspace-panel").remove();
    }

    $(".activeInfo").removeClass("activeInfo");
    this.element.addClass("activeInfo");

    var title = "<h1>" + this.metadata.title + "</h1>";
    var meta = "<div class='metadata'><p class='cat'>" + this.metadata.category + "</p><p class='desc'>" + this.metadata.description + "</p></div>";
    var post = "<div class='post'>" + this.metadata.post + "</div>";

    var images = "<div class='images'><div id='image-inset'>";
    for (var i = 0; i < this.metadata.images.length; i++) {
      images += "<div class='image-item'><img src='img/" + this.metadata.images[i] + "'/></div>";
    }
    images += "</div></div>";

    $('<div/>', {
      "id": 'workspace-panel',
    }).append(title + meta + post + images).appendTo('.workspace-wrapper');

    $('#image-inset').imagesLoaded( function() {
      console.log("images loaded");
      $('#image-inset').isotope({
        // options...
        itemSelector: '.image-item',
        percentPosition: true,
        cellsByRow: {
          columnWidth:'.image-sizer',
          rowHeight: '.image-sizer'
        }
      });

    });
  }
}

class ListMap {

  constructor(obj) {
    this.metadata = {
      index: obj._id,
      title: obj.title,
      thumb: obj.img,
      description: obj.description,
      category: obj.category,
      post: obj.post,
      images: obj.images,
      video: obj.video,
      datasources: obj.datasources
    }

    // add it to the DOM
    this.element = this.createDom();
    this.element.appendTo('#list');

    // make sure it's clickable
    this.element.on('mousedown', this.mouseDown.bind(this)); // bind the whole object, rather than just the DOM element
  }

  createDom() {
    let img = $("<img/>", {
      "src": "img/" + this.metadata.thumb,
      "draggable": "false",
    })

    let title = $("<h1/>").text(this.metadata.title);

    return $('<div/>', {
        "class": 'list-item',
        "data-title": this.metadata.title,
        "data-index": this.metadata.index,
        "data-category": this.metadata.category,
    }).append(img).append(title);
  }

  mouseDown() {
    let x = window.event.clientX-tileSize/2;
    let y = window.event.clientY-tileSize/2;

    let workspaceObj = new WorkspaceMap(this.metadata, x, y, true);
    workspace.maps.push(workspaceObj);
  }
}

class Group {

  constructor(color, firstMap, secondMap, tempX, tempY) {
    this.color = color;
    this.maps = [firstMap, secondMap];
    this.expanded = false;
    this.dragging = false;

    this.x = tempX;
    this.y = tempY;

    this.element = this.createGroupDOM(firstMap, secondMap);

    this.element.on('dblclick', this.toggleView.bind(this));
    this.element.on('mousedown', this.dragGroup.bind(this));
    this.element.hover(this.showBackground.bind(this), this.removeBackground.bind(this));
  }

  createGroupDOM(a, b) {

    a.element.css({
      "border-color": this.color,
      "position": "absolute",
      "top": "10px",
      "left": "10px",
    });
    b.element.css({
      "border-color": this.color,
      "position": "absolute",
      "top": "20px",
      "left": "20px",
    });

    var newGroup = $('<div/>', {
        "class": 'workspace-group',
        "id": (workspace.groups.length).toString(),
        css: {
          "width": "134px",
          "height": "134px",
          "position": "absolute",
          "left": this.x,
          "top": this.y,

        },
    }).append(a.element);
    newGroup.append(b.element);

    $("#workspace").append(newGroup);

    return newGroup;
  }

  addMap(map) {
    map.element.css({
      "border-color": this.color,
      "position": "absolute",
      "top": (this.maps.length*10+10 + "px"),
      "left": (this.maps.length*10+10 + "px")
    });

    this.element.append(map.element);
    this.element.css({
      "width": ((120 + this.maps.length*10) + "px"),
      "height": ((120 + this.maps.length*10) + "px"),
    })

    this.maps.push(map);
  }

  removeMap() {

  }

  shuffle() {

  }

  dragGroup() {
    if (!this.expanded) {
      this.element.attr("id","dragging");

      var currentX = 0, currentY = 0, previousX = 0, previousY = 0;
      var e = window.event;
      // get the mouse cursor position at startup:
      previousX = e.clientX;
      previousY = e.clientY;

      document.onmousemove = elementDrag.bind(this); // call a function whenever the cursor moves:
      document.onmouseup = stopDraggingElement.bind(this); // stop the dragging

      function elementDrag(e) {
        this.dragging = true;
        e = e || window.event;
        // calculate the new cursor position:
        currentX = previousX - e.clientX;
        currentY = previousY - e.clientY;
        previousX = e.clientX;
        previousY = e.clientY;
        // set the element's new position:
        let elem = document.getElementById("dragging");
        elem.style.top = (elem.offsetTop - currentY) + "px";
        elem.style.left = (elem.offsetLeft - currentX) + "px";
      }

      function stopDraggingElement(e) {
        e = e || window.event;

        // stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;

        // snap to grid
        let elem = document.getElementById("dragging");
        let topRound = roundToGrid(elem.offsetTop - currentY);
        let leftRound = roundToGrid(elem.offsetLeft - currentX);
        elem.style.top = (topRound - 2) + "px";
        elem.style.left = (leftRound - 2) + "px";

        this.x = elem.style.left;
        this.y = elem.style.top;

        $('#dragging').attr("id", null);

        setTimeout(function() {
          this.dragging = false;
        },100);
      }
    }
  }

  toggleView() {
    if (this.expanded) {
      this.stackAll();
    } else {
      this.expandAll();
    }
  }

  stackAll() {
    console.log("stack");
    this.expanded = false;

    for (var i = 0; i < this.maps.length; i++) {
      var mapElement = this.maps[i].element;
      mapElement.css({
        "top": 10*i + 10 + "px",
        "left": 10*i + 10 + "px",
        "z-index": i,
      })
    }

    this.element.css({
      "width": (((this.maps.length+1)*10 + 104) + "px"),
      "height": (((this.maps.length+1)*10 + 104) + "px"),
      "background-color": this.color
    })
  }

  expandAll() {
    this.expanded = true;

    for (var i = 0; i < this.maps.length; i++) {
      var mapElement = this.maps[i].element;
      mapElement.css({
        "top": "10px",
        "left": 10*(i+1) + 104*i + "px"
      })
    }

    this.element.css({
      "width": ((this.maps.length*104 + (this.maps.length+1)*10) + "px"),
      "height": ("124px"),
      "background-color": this.color
    })
  }

  showBackground() {
    this.element.css({
      "background-color": this.color
    })
  }

  removeBackground() {
    if (!this.expanded) {
      this.element.css({
        "background-color": "transparent"
      })
    }
  }
}

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

    this.maps = [];
    this.groups = [];
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

    console.log(this);
  }
}




function roundToGrid(num) {
  return Math.ceil((num+1) / 25) * 25;
}

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
          addWorkspaceToList(workspaceData.metadata.title);
      },
      error: function(err) {
          console.log(err);
      }
  });
}

function addWorkspaceToList(title) {
  $("#existing-workspaces").append("<li>" + title + "</li>")
}
